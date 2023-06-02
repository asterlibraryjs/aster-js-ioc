import type { AbortToken } from "@aster-js/async";

import type { IServiceProvider } from "../../service-provider";
import type { ServiceIdentifier } from "../../service-registry";

import type { ServiceSetupDelegate } from "../iioc-module-builder";

import { SafeIoCModuleSetupAction } from "./safe-ioc-module-setup-action";

export class IoCModuleServiceSetupAction<T> extends SafeIoCModuleSetupAction {

    constructor(
        private readonly _serviceId: ServiceIdentifier<T>,
        private readonly _action: ServiceSetupDelegate<T>,
        private readonly _required?: boolean
    ) {
        super();
    }

    async execImpl(provider: IServiceProvider, token?: AbortToken): Promise<void> {
        const svc = provider.get(this._serviceId, this._required);
        if (svc) await this._action(svc, token);
    }
}
