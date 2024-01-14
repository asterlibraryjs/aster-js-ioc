import { IDisposable } from "@aster-js/core";
import { AbortToken } from "@aster-js/async";

import { IServiceProvider, ServiceProvider } from "../service-provider";
import { IIoCContainerBuilder } from "./iioc-module-builder";
import { ServiceIdentifier } from "../service-registry";

export const IIoCModule = ServiceIdentifier<IIoCModule>("IIoCModule");

export enum IoCModuleSetupResultBehavior {
    continue,
    stop
}

export enum IoCModuleSetupExecBehavior {
    blocking,
    asynchronous
}

export interface IIoCModuleSetupAction {
    readonly execBehavior: IoCModuleSetupExecBehavior;
    exec(provider: IServiceProvider, token?: AbortToken): Promise<IoCModuleSetupResultBehavior>;
}

/**
 * An IoC module is the root object that contains all your services for a specific scope.
 *
 * Inside an IoC kernel, which is itself an IoC module, multiple IoC module will be instanciate to create child scope.
 *
 * And IoCModule contains its own services, running states and a clean way to dispose of all allocated resources.
 */
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
