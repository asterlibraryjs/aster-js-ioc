import { Delayed } from "@aster-js/async";

import { ServiceCollection } from "../service-collection";
import {  IServiceProvider, ServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCModule } from "./ioc-module";
import { IoCContainerBuilder } from "./ioc-container-builder";

export class IoCModuleBuilder extends IoCContainerBuilder {

    constructor(
        private readonly _result: Delayed<IIoCModule>,
        private readonly _parent: IIoCModule
    ) {
        super();
    }

    protected createModule(provider: IServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule {
        const result = new IoCModule(provider, setups, this._parent);
        this._result.set(result);
        return result;
    }

    protected createServiceProvider(services: ServiceCollection): IServiceProvider {
        return new ServiceProvider(services, this._parent.services);
    }
}
