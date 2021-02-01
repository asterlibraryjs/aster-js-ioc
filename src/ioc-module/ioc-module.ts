import { IServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCModuleBase } from "./ioc-module-base";


export class IoCModule extends IoCModuleBase {

    get parent(): IIoCModule { return this._parent; }

    constructor(
        provider: IServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>,
        private readonly _parent: IIoCModule
    ) {
        super(provider, setupCallbacks);
    }
}
