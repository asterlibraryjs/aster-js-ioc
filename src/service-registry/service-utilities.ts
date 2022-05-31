import { Constructor } from "@aster-js/core";
import { ServiceScope } from "src/service-descriptors";
import { ServiceIdentifier } from "./service-identifier";

export function isAllowedScope(scope: ServiceScope, owned: boolean): boolean {
    if (owned) {
        return (scope & ServiceScope.container) === ServiceScope.container;
    }
    return (scope & ServiceScope.children) === ServiceScope.children;
}

export function resolveServiceId<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>): ServiceIdentifier<T> {
    if (ServiceIdentifier.is(serviceIdOrCtor)) {
        return serviceIdOrCtor;
    }

    const serviceId = ServiceIdentifier.registry.resolve(serviceIdOrCtor);
    if (serviceId) return serviceId;

    throw new Error(`${serviceIdOrCtor} is neither a service id, neither a valid registered constructor.`);
}
