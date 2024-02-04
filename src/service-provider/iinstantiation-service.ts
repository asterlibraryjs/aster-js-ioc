import { IEvent } from "@aster-js/events";

import { IServiceDescriptor } from "../service-descriptors";
import { ServiceIdentifier } from "../service-registry";
import { ServiceEntry } from "./service-entry";
import { InstantiationContext } from "./instantiation-context";

export const IInstantiationService = ServiceIdentifier<IInstantiationService>({ name: "IInstantiationService", unique: true });

/** Provides methods to retrieve services and resolving dependencies */
export interface IInstantiationService {

    readonly onDidServiceInstantiated: IEvent<[desc: IServiceDescriptor, instance: any]>;
    createService(desc: IServiceDescriptor): any;
    instanciateService(entry: ServiceEntry, ctx: InstantiationContext): void
}
