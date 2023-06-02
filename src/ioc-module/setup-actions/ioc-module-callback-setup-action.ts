import type { AbortToken } from "@aster-js/async";

import { IServiceAccessor } from "../../service-provider/iservice-accessor"
;
import type { IServiceProvider } from "../../service-provider";

import type { IoCModuleSetupDelegate } from "../iioc-module-builder";

import { SafeIoCModuleSetupAction } from "./safe-ioc-module-setup-action";


export class IoCModuleCallbackSetupAction extends SafeIoCModuleSetupAction {

    constructor(
        private readonly _action: IoCModuleSetupDelegate
    ) {
        super();
    }

    async execImpl(provider: IServiceProvider, token?: AbortToken): Promise<void> {
        const acc = provider.get(IServiceAccessor, true);
        await this._action(acc, token);
    }
}
