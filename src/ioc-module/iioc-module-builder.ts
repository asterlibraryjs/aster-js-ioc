import { AbortToken } from "@aster-js/async";
import { Constructor } from "@aster-js/core";

import { IServiceAccessor } from "../service-provider/iservice-accessor";
import { ServiceCollection } from "../service-collection";
import { ServiceIdentifier } from "../service-registry";

import { IIoCModule } from "./iioc-module";

export type ServiceSetupDelegate<T = any> = (svc: T) => any;

export type IoCModuleConfigureDelegate = (services: ServiceCollection) => void;

export type IoCModuleSetupDelegate = (serviceAccessor: IServiceAccessor, token?: AbortToken) => Promise<void>;

export interface IIoCContainerBuilder {
    configure(action: IoCModuleConfigureDelegate): this;
    use(action: IoCModuleSetupDelegate): this;
    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): this;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): this;
    build(): IIoCModule;
}
