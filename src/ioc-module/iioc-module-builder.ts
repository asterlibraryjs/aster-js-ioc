import { AbortToken } from "@aster-js/async";
import { Constructor } from "@aster-js/core";

import { IServiceAccessor } from "../service-provider/iservice-accessor";
import { ServiceCollection } from "../service-collection";
import { ServiceIdentifier } from "../service-registry";

import { IIoCModule } from "./iioc-module";

export type ServiceSetupDelegate<T = any> = (svc: T, token?: AbortToken) => any;

export type IoCModuleConfigureDelegate = (services: ServiceCollection) => void;

export type IoCModuleSetupDelegate = (serviceAccessor: IServiceAccessor, token?: AbortToken) => Promise<void>;

export interface IIoCContainerBuilder {
    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder;
    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder;
    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    build(): IIoCModule;
}

export interface ISetupIoCContainerBuilder extends IIoCContainerBuilder {
    catch(errorHandler: (err: any) => boolean): IIoCContainerBuilder;
}
