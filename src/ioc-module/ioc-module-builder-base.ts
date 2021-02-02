import { Disposable } from "@aster-js/core";

import { ServiceCollection } from "../service-collection";
import { ServiceIdentifier, ServiceIdentityTag } from "../service-registry";
import { IServiceProvider } from "../service-provider";

import { IIoCContainerBuilder } from "./iioc-module-builder";
import { ServiceSetupDelegate, IoCModuleSetupDelegate, IoCModuleConfigureDelegate } from "./iioc-module-builder";
import { IIoCModule } from "./iioc-module";

export abstract class IoCModuleBuilderBase extends Disposable implements IIoCContainerBuilder {
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

    use<T>(action: IoCModuleSetupDelegate): this;
    use<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    use<T>(serviceIdOrAction: ServiceIdentifier<T> | IoCModuleSetupDelegate, action?: ServiceSetupDelegate<T>, required: boolean = true): this {
        this.checkIfDisposed();

        if (ServiceIdentityTag.has(serviceIdOrAction)) {
            const setup: IoCModuleSetupDelegate = async (acc) => {
                const svc = acc.get(serviceIdOrAction as ServiceIdentifier<T>, required);
                if (svc) await action!(svc);
            }
            this._setups.push(setup)
        }
        else {
            this._setups.push(serviceIdOrAction as IoCModuleSetupDelegate);
        }
        return this;
    }

    build(): IIoCModule {
        this.checkIfDisposed();

        const services = new ServiceCollection(this._services);

        const provider = this.createServiceProvider(services);
        this.configureDefaultServices(services, provider);

        return this.createModule(provider, [...this._setups]);
    }
 
    protected abstract createModule(provider: IServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule;

    protected abstract createServiceProvider(services: ServiceCollection): IServiceProvider;

    protected configureDefaultServices(services: ServiceCollection, provider: IServiceProvider): void {
        services.addScoped(IServiceProvider.factory(provider));
    }
}
