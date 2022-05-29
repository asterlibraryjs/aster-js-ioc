import { Constructor, Disposable } from "@aster-js/core";

import { ServiceCollection } from "../service-collection";
import { ServiceIdentifier } from "../service-registry";
import type { ServiceProvider } from "../service-provider";

import type { IIoCContainerBuilder } from "./iioc-module-builder";
import type { ServiceSetupDelegate, IoCModuleSetupDelegate, IoCModuleConfigureDelegate } from "./iioc-module-builder";
import type { IIoCModule } from "./iioc-module";

export abstract class IoCContainerBuilder extends Disposable implements IIoCContainerBuilder {
    private readonly _services: ServiceCollection;
    private readonly _setups: IoCModuleSetupDelegate[] = [];

    constructor() {
        super();
        this._services = new ServiceCollection();
    }

    configure(action: IoCModuleConfigureDelegate): this {
        action(this._services);
        return this;
    }

    use(action: IoCModuleSetupDelegate): this {
        this.checkIfDisposed();

        this._setups.push(action);
        return this;
    }

    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    setup<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, required: boolean = true): this {
        this.checkIfDisposed();

        const serviceId = this.resolveServiceId(serviceIdOrCtor);

        this._setups.push(async acc => {
            const svc = acc.get<T>(serviceId, required);
            if (svc) await action(svc);
        });

        return this;
    }

    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): this;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): this;
    setupMany<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly: boolean = true): this {
        this.checkIfDisposed();

        const serviceId = this.resolveServiceId(serviceIdOrCtor);

        this._setups.push(async acc => {
            const all = [...acc.getAll<T>(serviceId, currentScopeOnly)].map(action);
            await Promise.all(all);
        });

        return this;
    }

    protected resolveServiceId<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>) {
        if (ServiceIdentifier.is(serviceIdOrCtor)) {
            return serviceIdOrCtor;
        }
        const serviceId = ServiceIdentifier.registry.resolve(serviceIdOrCtor);
        if (serviceId) return serviceId;

        throw new Error(`${serviceIdOrCtor} is neither a service id, neither a valid registered constructor.`);
    }

    build(): IIoCModule {
        this.checkIfDisposed();

        const services = new ServiceCollection(this._services);

        const provider = this.createServiceProvider(services);
        this.configureDefaultServices && this.configureDefaultServices(services, provider);

        return this.createModule(provider, [...this._setups]);
    }

    protected abstract createModule(provider: ServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule;

    protected abstract createServiceProvider(services: ServiceCollection): ServiceProvider;

    protected configureDefaultServices?(services: ServiceCollection, provider: ServiceProvider): void;
}
