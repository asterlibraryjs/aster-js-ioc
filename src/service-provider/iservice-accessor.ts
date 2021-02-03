import { IDisposable } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry/service-identifier";

export const IServiceAccessor = ServiceIdentifier<IServiceAccessor>("IServiceAccessor");

export interface IServiceAccessor extends IDisposable {
    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
}