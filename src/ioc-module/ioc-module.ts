import { ServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCContainer } from "./ioc-container";

export class IoCModule extends IoCContainer {

    get parent(): IIoCModule { return this._parent; }

    constructor(
        provider: ServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>,
        private readonly _parent: IIoCModule
    ) {
        super(provider, setupCallbacks);
    }
}
