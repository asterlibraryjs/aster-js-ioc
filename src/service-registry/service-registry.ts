import { Constructor } from "@aster-js/core";

import { ServiceIdentifier, ServiceIdentityTag, ServiceIdentifierOptions } from './service-identifier';

export type DependencyParameterType = "optional" | "required" | "many";

export interface DependencyParameter {
    readonly serviceId: ServiceIdentifier;
    readonly index: number;
    readonly type: DependencyParameterType;
}

export namespace ServiceRegistry {
    const _serviceIds: Map<string | symbol, [ServiceIdentifier, ServiceIdentifierOptions]> = new Map();
    const _dependencies: Map<Constructor, DependencyParameter[]> = new Map();

    export function* dependencies(ctor: Constructor): Iterable<DependencyParameter> {
        const deps = _dependencies.get(ctor);
        if (deps) yield* deps.sort((l, r) => l.index - r.index);
    }

    export function register(serviceId: ServiceIdentifier, options: ServiceIdentifierOptions): void {
        const tagId = ServiceIdentityTag.get(serviceId);

        if (!tagId) {
            throw new Error(`Invalid service id: ${serviceId}`);
        }

        if (_serviceIds.has(tagId)) {
            throw new Error(`Service "${options.name}" already exists.`);
        }

        _serviceIds.set(tagId, [serviceId, options]);
    }

    export function addDependency(serviceCtor: Constructor, serviceId: ServiceIdentifier, index: number, type: DependencyParameterType): void {
        const dependencies = _dependencies.get(serviceCtor);
        if (dependencies) {
            dependencies.push({ serviceId, index, type });
            dependencies.sort((a, b) => a.index - b.index)
        }
        else {
            _dependencies.set(serviceCtor, [{ serviceId, index, type }]);
        }
    }
}
