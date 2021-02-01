import { Constructor, Tag } from "@aster-js/core";

import { ServiceIdentifier } from "./service-identifier";

const _serviceContractTag = Tag<ServiceIdentifier>("serviceContract");

export function ServiceContract<T>(serviceId: ServiceIdentifier<T>) {
    return (target: Constructor<T>) => {
        _serviceContractTag.set(target, serviceId);
    };
}

export namespace ServiceContract {

    export const Tag = _serviceContractTag.readOnly();

    export function resolve(ctor: Constructor, createIfNotExists: true): ServiceIdentifier;
    export function resolve(ctor: Constructor, createIfNotExists: false): ServiceIdentifier | undefined;
    export function resolve(ctor: Constructor, createIfNotExists: boolean): ServiceIdentifier | undefined {
        let serviceId = _serviceContractTag.get(ctor);
        if (serviceId) return serviceId;

        if (createIfNotExists) {
            serviceId = ServiceIdentifier(ctor.name);
            _serviceContractTag.set(ctor, serviceId);
            return serviceId;
        }
    }
}
