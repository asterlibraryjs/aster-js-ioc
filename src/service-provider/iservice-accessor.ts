import { IDisposable } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";

export const IServiceAccessor = ServiceIdentifier<IServiceAccessor>("IServiceAccessor");

export interface IServiceAccessor extends IDisposable {
    has(serviceId: ServiceIdentifier): boolean;
    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
}