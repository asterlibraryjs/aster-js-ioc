import type { Delayed } from "@aster-js/async";

import type { ServiceProvider } from "../service-provider/service-provider";

import { IoCContainer } from "./ioc-container";
import { IoCModuleBuilder } from "./ioc-module-builder";

import type { IIoCModule, IIoCModuleSetupAction } from "./iioc-module";

export type IoCModuleFactory = (name: string, provider: ServiceProvider, setupCallbacks: Iterable<IIoCModuleSetupAction>, parent: IIoCModule) => IIoCModule;

export class IoCModule extends IoCContainer {

    get parent(): IIoCModule { return this._parent; }

    private constructor(
        name: string,
        provider: ServiceProvider,
        setupCallbacks: Iterable<IIoCModuleSetupAction>,
        private readonly _parent: IIoCModule
    ) {
        super(name, provider, setupCallbacks);
    }

    protected createIoCModuleBuilder(name: string, target: Delayed<IIoCModule>): IoCModuleBuilder {
        return new IoCModuleBuilder(name, target, this, IoCModule.factory);
    }

    static factory(name: string, provider: ServiceProvider, setupCallbacks: Iterable<IIoCModuleSetupAction>, parent: IIoCModule): IIoCModule {
        return new IoCModule(name, provider, setupCallbacks, parent);
    }
}
