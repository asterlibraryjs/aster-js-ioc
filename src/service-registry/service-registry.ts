import { Constructor, ReadonlyTag } from "@aster-js/core";

import { ServiceIdentifier, ServiceIdentifierOptions, ServiceIdentityTag } from './service-identifier';

export type DependencyParameterType = "optional" | "required" | "many" | "options";

export interface DependencyParameter {
    readonly serviceId: ServiceIdentifier;
    readonly index: number;
    readonly type: DependencyParameterType;
}

export class ServiceRegistry {
    private readonly _serviceIds: Map<string | symbol | Constructor, [ServiceIdentifier, ServiceIdentifierOptions]> = new Map();
    private readonly _dependencies: Map<Constructor, DependencyParameter[]> = new Map();

    constructor(
        private readonly _resolver: (ctor: Constructor) => ServiceIdentifier,
        private readonly _tag: ReadonlyTag<string | symbol | Constructor | undefined>
    ) {

    }

    *dependencies(ctor: Constructor): Iterable<DependencyParameter> {
        const deps = this._dependencies.get(ctor);
        if (deps) yield* deps.sort((l, r) => l.index - r.index);
    }

    get(tag: string | symbol | Constructor): ServiceIdentifier | null {
        const entry = this._serviceIds.get(tag);
        return entry ? entry[0] : null;
    }

    resolve(ctor: Constructor): ServiceIdentifier {
        const entry = this._serviceIds.get(ctor);
        if (entry) return entry[0];

        return this._resolver(ctor);
    }

    add(serviceId: ServiceIdentifier, options: ServiceIdentifierOptions): void {
        const tagId = ServiceIdentityTag(serviceId);

        if (!tagId) {
            throw new Error(`Invalid service id: ${serviceId}`);
        }

        if (this._serviceIds.has(tagId)) {
            throw new Error(`Service "${options.name}" already exists.`);
        }

        this._serviceIds.set(tagId, [serviceId, options]);
    }

    addDependency(serviceCtor: Constructor, serviceId: ServiceIdentifier, index: number, type: DependencyParameterType): void {
        const dependencies = this._dependencies.get(serviceCtor);
        if (dependencies) {
            dependencies.push({ serviceId, index, type });
            dependencies.sort((a, b) => a.index - b.index)
        }
        else {
            this._dependencies.set(serviceCtor, [{ serviceId, index, type }]);
        }
    }
}
