import { AbortToken } from "@aster-js/async";
import { Constructor } from "@aster-js/core";

import { IServiceAccessor } from "../service-provider/iservice-accessor";
import { IServiceCollection } from "../service-collection";
import { ServiceIdentifier } from "../service-registry";

import { IIoCModule } from "./iioc-module";
import { SetupErrorHandlerDelegate } from "./setup-actions";

export type ServiceSetupDelegate<T = any> = (svc: T, token?: AbortToken) => any;

export type IoCModuleConfigureDelegate = (services: IServiceCollection) => void;

export type IoCModuleSetupDelegate = (serviceAccessor: IServiceAccessor, token?: AbortToken) => Promise<void>;

/** Provides a builder that will help to start an IoC container */
export interface IIoCContainerBuilder {
    /** Configure the module through the provided callback by providing a way to add services */
    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder;
    /** Add setup actions to execute at the start of the application */
    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder;
    /** Add a setup action to execute at the start of the application over a specific service */
    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    /** Add a setup action to execute at the start of the application over a specific service */
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    /** Add a setup action to execute at the start of the application over many services with the same identifier */
    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    /** Add a setup action to execute at the start of the application over many services with the same identifier */
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    /** Build a new container using the registered services and setups */
    build(): IIoCModule;
}

export interface ISetupIoCContainerBuilder extends IIoCContainerBuilder {
    /** The promise still be awaited before application is started but other setup will not await after this setup to start */
    continueWithoutAwaiting(): IIoCContainerBuilder;
    /** Enable to catch errors and returns a specific result to indicate how the setup should react to errors */
    catch(errorHandler: SetupErrorHandlerDelegate): IIoCContainerBuilder;
}
