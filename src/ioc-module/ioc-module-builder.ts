import type { Delayed } from "@aster-js/async";

import type { ServiceCollection } from "../service-collection";
import { ServiceProvider } from "../service-provider";

import type { IIoCModule } from "./iioc-module";
import type { IoCModuleSetupDelegate } from "./iioc-module-builder";
import type { IoCModuleFactory } from "./ioc-module";
import { IoCContainerBuilder } from "./ioc-container-builder";

export class IoCModuleBuilder extends IoCContainerBuilder {

    constructor(
        private readonly _result: Delayed<IIoCModule>,
        private readonly _parent: IIoCModule,
        private readonly _factory: IoCModuleFactory
    ) {
        super();
    }

    protected createModule(provider: ServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule {
        const result = this._factory(provider, setups, this._parent);
        this._result.set(result);
        return result;
    }

    protected createServiceProvider(services: ServiceCollection): ServiceProvider {
        return new ServiceProvider(services, this._parent.services);
    }
}
