import type { Delayed } from "@aster-js/async";

import  { ServiceProvider } from "../service-provider/service-provider";

import type { ServiceCollection } from "../service-collection";

import { IoCContainerBuilder } from "./ioc-container-builder";

import type { IIoCModule, IIoCModuleSetupAction } from "./iioc-module";
import type { IoCModuleFactory } from "./ioc-module";

export class IoCModuleBuilder extends IoCContainerBuilder {

    constructor(
        name: string,
        private readonly _result: Delayed<IIoCModule>,
        private readonly _parent: IIoCModule,
        private readonly _factory: IoCModuleFactory
    ) {
        super(name);
    }

    protected createModule(name: string, provider: ServiceProvider, setups: IIoCModuleSetupAction[]): IIoCModule {
        const result = this._factory(name, provider, setups, this._parent);
        this._result.set(result);
        return result;
    }

    protected createServiceProvider(services: ServiceCollection): ServiceProvider {
        return ServiceProvider.create(services, this._parent.services);
    }
}
