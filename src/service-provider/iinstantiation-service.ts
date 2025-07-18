import { IEvent } from "@aster-js/events";

import { IServiceDescriptor } from "../service-descriptors";
import { ServiceIdentifier } from "../service-registry";
import { ServiceEntry } from "./service-entry";
import { InstantiationContext } from "./instantiation-context";

export const IInstantiationService = ServiceIdentifier<IInstantiationService>({ namespace: "@aster-js/ioc", name: "IInstantiationService", unique: true });

/** Provides methods to retrieve services and resolving dependencies */
export interface IInstantiationService {

    readonly onDidServiceInstantiated: IEvent<[desc: IServiceDescriptor, instance: any]>;
    createService(desc: IServiceDescriptor): any;
    instantiateService(entry: ServiceEntry, ctx: InstantiationContext): void
}
