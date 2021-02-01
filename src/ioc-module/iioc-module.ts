import { IDisposable } from "@aster-js/core";
import { AbortToken } from "@aster-js/async";

import { IServiceProvider } from "../service-provider";
import { IIoCContainerBuilder } from "./iioc-module-builder";

export interface IIoCModule extends IDisposable, Iterable<IIoCModule> {
    readonly parent?: IIoCModule;
    
    readonly running: boolean;
    
    readonly ready: PromiseLike<void>;

    readonly abortToken: AbortToken;

    readonly services: IServiceProvider;

    createScope(name: string): IIoCContainerBuilder;

    start(): Promise<void>;
}
