import { IDisposable } from "@aster-js/core";
import { AbortToken } from "@aster-js/async";

import { IServiceProvider, ServiceProvider } from "../service-provider";
import { IIoCContainerBuilder } from "./iioc-module-builder";
import { ServiceIdentifier } from "../service-registry";

export const IIoCModule = ServiceIdentifier<IIoCModule>({ namespace: "@aster-js/ioc", name: "IIoCModule", unique: true });

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
export interface IIoCModule extends IDisposable, AsyncIterable<IIoCModule> {
    /** Name of the module. This name is unique inside its parent module. */
    readonly name: string;
    /** Path composed of the all parent hierarchy name */
    readonly path: string;
    /** Parent module. In exception of the kernel, parent is always present. */
    readonly parent?: IIoCModule;
    /** Indicate whether or not the module is currently started and running. */
    readonly running: boolean;
    /** Promise resolve when the startup is done. This promise is available before the start and resolve when the start is done. */
    readonly ready: PromiseLike<this>;
    /** Application abort token */
    readonly abortToken: AbortToken;
    /** Service provider that give access to all registered services */
    readonly services: ServiceProvider;
    /** Create new child own container */
    createChildScope(name: string): IIoCContainerBuilder;
    /** Start the application and return a promise resolved when the application is properly setup.
     * This promise will be resolved just after the ready one meaning that both give the same information of "startup finished" */
    start(): Promise<boolean>;
}
