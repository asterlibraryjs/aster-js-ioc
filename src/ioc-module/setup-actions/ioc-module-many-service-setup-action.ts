import type { AbortToken } from "@aster-js/async";

import type { IServiceProvider } from "../../service-provider";
import type { ServiceIdentifier } from "../../service-registry";

import type { ServiceSetupDelegate } from "../iioc-module-builder";

import { SafeIoCModuleSetupAction } from "./safe-ioc-module-setup-action";

export class IoCModuleManyServiceSetupAction<T> extends SafeIoCModuleSetupAction {

    constructor(
        private readonly _serviceId: ServiceIdentifier<T>,
        private readonly _action: ServiceSetupDelegate<T>,
        private readonly _currentScopeOnly?: boolean
    ) {
        super();
    }

    async execImpl(provider: IServiceProvider, token?: AbortToken): Promise<void> {
        const services = [...provider.getAll<T>(this._serviceId, this._currentScopeOnly)];
        const all = services.map(x => this._action(x));
        await Promise.all(all);
    }
}
