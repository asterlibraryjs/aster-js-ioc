import { Constructor } from "@aster-js/core";

import { IServiceDescriptor } from "../service-descriptors";
import { ServiceIdentifier } from "../service-registry";

export const IServiceProvider = ServiceIdentifier<IServiceProvider>({ namespace: "@aster-js/ioc", name: "IServiceProvider", unique: true });

export interface IServiceProvider {
    parent(): IServiceProvider | undefined;
    getOwnDescriptors(serviceId: ServiceIdentifier): Iterable<IServiceDescriptor>;
    getOwnInstance(desc: IServiceDescriptor): any;
    createInstance<T>(ctor: Constructor<T>, ...baseArgs: ReadonlyArray<any>): T;
    resolve(ctor: Constructor): Constructor;
    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T> | IServiceDescriptor, required?: boolean): T | undefined;
    getAll<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T>;
}
