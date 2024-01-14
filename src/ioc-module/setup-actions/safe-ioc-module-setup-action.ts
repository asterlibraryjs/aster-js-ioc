import type { AbortToken } from "@aster-js/async";

import type { IServiceProvider } from "../../service-provider";

import { IIoCModuleSetupAction, IoCModuleSetupExecBehavior, IoCModuleSetupResultBehavior } from "../iioc-module";

export type SetupErrorHandlerDelegate = (err: any, provider: IServiceProvider) => SetupErrorHandlerResult | boolean | void;

export enum SetupErrorHandlerResult {
    stop,
    continue,
    throw
}

export abstract class SafeIoCModuleSetupAction implements IIoCModuleSetupAction {
    private _errorHandler?: SetupErrorHandlerDelegate;
    private _execBehavior: IoCModuleSetupExecBehavior = IoCModuleSetupExecBehavior.blocking;

    get execBehavior(): IoCModuleSetupExecBehavior { return this._execBehavior; }

    async exec(provider: IServiceProvider, token?: AbortToken): Promise<IoCModuleSetupResultBehavior> {
        try {
            await this.execImpl(provider, token);
            return IoCModuleSetupResultBehavior.continue;
        }
        catch (err) {
            const behavior = this._errorHandler?.(err, provider);
            switch (behavior) {
                case undefined:
                case true:
                case SetupErrorHandlerResult.continue:
                    return IoCModuleSetupResultBehavior.continue;
                case SetupErrorHandlerResult.stop:
                case false:
                    return IoCModuleSetupResultBehavior.stop;
                case SetupErrorHandlerResult.throw:
                    throw err;
                default:
                    throw new Error("Invalid result");
            }
        }
    }

    abstract execImpl(provider: IServiceProvider, token?: AbortToken): Promise<void>;

    continueWithoutAwaiting(): void {
        this._execBehavior = IoCModuleSetupExecBehavior.asynchronous;
    }

    onError(errorHandler: SetupErrorHandlerDelegate): void {
        this._errorHandler = errorHandler;
    }
}
