import { Constructor, Disposable } from "@aster-js/core";

import { ServiceCollection } from "../service-collection/service-collection";
import {  resolveServiceId } from "../service-registry/service-utilities";

import type { ServiceIdentifier } from "../service-registry";
import type { ServiceProvider } from "../service-provider";

import type { IIoCContainerBuilder, ISetupIoCContainerBuilder } from "./iioc-module-builder";
import type { ServiceSetupDelegate, IoCModuleSetupDelegate, IoCModuleConfigureDelegate } from "./iioc-module-builder";
import { IIoCModule, IIoCModuleSetupAction } from "./iioc-module";

import { IoCModuleCallbackSetupAction, IoCModuleManyServiceSetupAction, IoCModuleServiceSetupAction, SafeIoCModuleSetupAction } from "./setup-actions";
import { SetupIoCContainerBuilder } from "./setup-ioc-container-builder";



export abstract class IoCContainerBuilder extends Disposable implements IIoCContainerBuilder {
    private readonly _services: ServiceCollection;
    private readonly _setups: IIoCModuleSetupAction[] = [];

    constructor(
        private readonly _name: string
    ) {
        super();
        this._services = new ServiceCollection();
    }

    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder {
        action(this._services);
        return this;
    }

    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder {
        this.checkIfDisposed();

        const setupAction = new IoCModuleCallbackSetupAction(action);
        return this.addSafeSetupAction(setupAction);
    }

    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, required: boolean = true): ISetupIoCContainerBuilder {
        this.checkIfDisposed();

        const serviceId = resolveServiceId(serviceIdOrCtor);
        const setupAction = new IoCModuleServiceSetupAction(serviceId, action, required);
        return this.addSafeSetupAction(setupAction);
    }

    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly: boolean = true): ISetupIoCContainerBuilder {
        this.checkIfDisposed();

        const serviceId = resolveServiceId(serviceIdOrCtor);
        const setupAction = new IoCModuleManyServiceSetupAction(serviceId, action, currentScopeOnly);
        return this.addSafeSetupAction(setupAction);
    }

    private addSafeSetupAction(setupAction: SafeIoCModuleSetupAction): ISetupIoCContainerBuilder {
        this._setups.push(setupAction);
        return new SetupIoCContainerBuilder(this, setupAction);
    }

    build(): IIoCModule {
        this.checkIfDisposed();

        const services = new ServiceCollection(this._services);

        const provider = this.createServiceProvider(services);
        this.configureDefaultServices && this.configureDefaultServices(services, provider);

        const module = this.createModule(this._name, provider, [...this._setups]);
        services.addInstance(IIoCModule, module);
        return module;
    }

    protected abstract createModule(name: string, provider: ServiceProvider, setups: IIoCModuleSetupAction[]): IIoCModule;

    protected abstract createServiceProvider(services: ServiceCollection): ServiceProvider;

    protected configureDefaultServices?(services: ServiceCollection, provider: ServiceProvider): void;
}
