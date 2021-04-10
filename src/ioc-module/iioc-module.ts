import { IDisposable } from "@aster-js/core";
import { AbortToken } from "@aster-js/async";

import { ServiceProvider } from "../service-provider";
import { IIoCContainerBuilder } from "./iioc-module-builder";

export interface IIoCModule extends IDisposable, Iterable<IIoCModule> {
    readonly parent?: IIoCModule;

    readonly running: boolean;

    readonly ready: PromiseLike<void>;

    readonly abortToken: AbortToken;

    readonly services: ServiceProvider;

    createChildScope(name: string): IIoCContainerBuilder;

    start(): Promise<boolean>;
}
