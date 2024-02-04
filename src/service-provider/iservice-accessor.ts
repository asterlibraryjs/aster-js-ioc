import { IDisposable } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry/service-identifier";

export const IServiceAccessor = ServiceIdentifier<IServiceAccessor>({ name: "IServiceAccessor", unique: true });

/**
 * Service id and implementation for giving temporary access to services
 */
export interface IServiceAccessor extends IDisposable {
    /**
     * Gets a temporary access to a service of a given Service id
     * @param serviceId Service id
     * @param required Indicates if the service is required
     */
    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    /**
     * Gets a temporary access to a service of a given Service id
     * @param serviceId Service id
     * @param required Indicates if the service is required
     */
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    /**
     * Gets a temporary access to all services of a given Service id
     * @param serviceId Service id
     * @param currentScopeOnly Indicates if the services should be retrieved from the current scope only
     */
    getMany<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T>;
}
