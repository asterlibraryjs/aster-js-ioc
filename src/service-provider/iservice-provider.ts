import { Constructor } from "@aster-js/core";

import { IServiceDescriptor } from "../service-descriptors";
import { ServiceIdentifier } from "../service-registry";

export const IServiceProvider = ServiceIdentifier<IServiceProvider>("IServiceProvider");

export interface IServiceProvider {
    getScopeInstance(desc: IServiceDescriptor): any;
    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    getAll<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T>;
}