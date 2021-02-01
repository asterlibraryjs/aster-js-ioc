import { Delayed } from "@aster-js/async";

import { IServiceStore } from "../service-collection";
import {  IServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCModule } from "./ioc-module";
import { IoCModuleBuilderBase } from "./ioc-module-builder-base";

export class IoCModuleBuilder extends IoCModuleBuilderBase {

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

    protected createServiceProvider(store: IServiceStore): IServiceProvider {
        return this._parent.services.createChild(name, store);
    }
}
