import type { Delayed } from "@aster-js/async";
import { ServiceProvider } from "../service-provider";

import type { IIoCModule } from "./iioc-module";
import type { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCContainer } from "./ioc-container";
import { IoCModuleBuilder } from "./ioc-module-builder";

export type IoCModuleFactory = (name: string, provider: ServiceProvider, setupCallbacks: Iterable<IoCModuleSetupDelegate>, parent: IIoCModule) => IIoCModule;

export class IoCModule extends IoCContainer {

    get parent(): IIoCModule { return this._parent; }

    private constructor(
        name: string,
        provider: ServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>,
        private readonly _parent: IIoCModule
    ) {
        super(name, provider, setupCallbacks);
    }

    protected createIoCModuleBuilder(name: string, target: Delayed<IIoCModule>): IoCModuleBuilder {
        return new IoCModuleBuilder(name, target, this, IoCModule.factory);
    }

    static factory(name: string, provider: ServiceProvider, setupCallbacks: Iterable<IoCModuleSetupDelegate>, parent: IIoCModule): IIoCModule {
        return new IoCModule(name, provider, setupCallbacks, parent);
    }
}
