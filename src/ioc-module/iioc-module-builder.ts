import { IIoCModule } from "./iioc-module";
import { IServiceAccessor } from "../service-provider/iservice-accessor";
import { ServiceCollection } from "../service-collection";
import { ServiceIdentifier } from "../service-registry";
import { AbortToken } from "../../../async";

export type ServiceSetupDelegate<T = any> = (svc: T) => any;

export type IoCModuleConfigureDelegate = (services: ServiceCollection) => void;

export type IoCModuleSetupDelegate = (serviceAccessor: IServiceAccessor, token?: AbortToken) => Promise<void>;

export interface IIoCContainerBuilder {
    configure(action: IoCModuleConfigureDelegate): this;
    use<T>(action: IoCModuleSetupDelegate): this;
    use<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): this;
    build(): IIoCModule;
}
