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

    export function resolve(ctor: Constructor): ServiceIdentifier {
        return _serviceContractTag.get(ctor)
            ?? ServiceIdentifier.registry.resolve(ctor);
    }
}
