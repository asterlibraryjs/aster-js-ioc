import type { AbortToken } from "@aster-js/async";

import type { IServiceProvider } from "../../service-provider";

import type { IIoCModuleSetupAction } from "../iioc-module";

export abstract class SafeIoCModuleSetupAction implements IIoCModuleSetupAction {
    private _errorHandler?: (err: any) => boolean;

    async exec(provider: IServiceProvider, token?: AbortToken): Promise<void> {
        try {
            await this.execImpl(provider, token);
        }
        catch (err) {
            if (this._errorHandler?.(err)) return;
            throw err;
        }
    }

    abstract execImpl(provider: IServiceProvider, token?: AbortToken): Promise<void>;

    onError(errorHandler: (err: any) => boolean): void {
        this._errorHandler = errorHandler;
    }
}
