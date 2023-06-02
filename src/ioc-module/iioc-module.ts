import { IDisposable } from "@aster-js/core";
import { AbortToken } from "@aster-js/async";

import { IServiceProvider, ServiceProvider } from "../service-provider";
import { IIoCContainerBuilder } from "./iioc-module-builder";
import { ServiceIdentifier } from "../service-registry";

export const IIoCModule = ServiceIdentifier<IIoCModule>("IIoCModule");

export interface IIoCModuleSetupAction {
    exec(provider: IServiceProvider, token?: AbortToken): Promise<void>;
}

export interface IIoCModule extends IDisposable, Iterable<IIoCModule> {
    readonly name: string;

    readonly parent?: IIoCModule;

    readonly running: boolean;

    readonly ready: PromiseLike<void>;

    readonly abortToken: AbortToken;

    readonly services: ServiceProvider;

    createChildScope(name: string): IIoCContainerBuilder;

    start(): Promise<boolean>;
}
