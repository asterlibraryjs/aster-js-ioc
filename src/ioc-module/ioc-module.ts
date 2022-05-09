import type { Delayed } from "@aster-js/async";
import { ServiceProvider } from "../service-provider";

import type { IIoCModule } from "./iioc-module";
import type { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCContainer } from "./ioc-container";
import { IoCModuleBuilder } from "./ioc-module-builder";

export type IoCModuleFactory = (provider: ServiceProvider, setupCallbacks: Iterable<IoCModuleSetupDelegate>, parent: IIoCModule) => IIoCModule;

export class IoCModule extends IoCContainer {

    get parent(): IIoCModule { return this._parent; }

    private constructor(
        provider: ServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>,
        private readonly _parent: IIoCModule
    ) {
        super(provider, setupCallbacks);
    }

    protected createIoCModuleBuilder(target: Delayed<IIoCModule>): IoCModuleBuilder {
        return new IoCModuleBuilder(target, this, IoCModule.factory);
    }

    static factory(provider: ServiceProvider, setupCallbacks: Iterable<IoCModuleSetupDelegate>, parent: IIoCModule): IIoCModule {
        return new IoCModule(provider, setupCallbacks, parent);
    }
}
