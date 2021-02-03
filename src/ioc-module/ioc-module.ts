import { IServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCContainer } from "./ioc-container";

export class IoCModule extends IoCContainer {

    get parent(): IIoCModule { return this._parent; }

    constructor(
        provider: IServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>,
        private readonly _parent: IIoCModule
    ) {
        super(provider, setupCallbacks);
    }
}
