import { DisposableHost, IDisposable } from "@aster-js/core";
import { Lookup } from "@aster-js/collections";

import { IServiceDescriptor } from "../service-descriptors";
import { ServiceIdentifier, ServiceIdentityTag } from "../service-registry";

import { IServiceCollection } from "./iservice-collection";

export class ServiceCollection extends DisposableHost implements IServiceCollection {
    private readonly _store: Lookup<ServiceIdentifier, IServiceDescriptor>;

    get size(): number { return this._store.size; }

    constructor(descriptors: Iterable<IServiceDescriptor> = []) {
        super();
        const values = ServiceCollection.entries(descriptors);
        this._store = Lookup.create(values, ServiceIdentityTag.get);
    }

    has(serviceIdOrDescriptor: ServiceIdentifier | IServiceDescriptor): boolean {
        if (ServiceIdentifier.is(serviceIdOrDescriptor)) {
            return this._store.has(serviceIdOrDescriptor as ServiceIdentifier);
        }
        const desc = serviceIdOrDescriptor as IServiceDescriptor;
        return this._store.hasValue(desc.serviceId, desc);
    }

    get(serviceId: ServiceIdentifier): Iterable<IServiceDescriptor> {
        return this._store.get(serviceId);
    }

    add(desc: IServiceDescriptor): this {
        this._store.add(desc.serviceId, desc);
        return this;
    }

    delete(desc: IServiceDescriptor): this {
        this._store.deleteValue(desc.serviceId, desc);
        return this;
    }

    *[Symbol.iterator](): IterableIterator<IServiceDescriptor> {
        for (const desc of this._store.values()) {
            yield desc;
        }
    }

    protected dispose(): void {
        IDisposable.safeDispose(this._store);
    }

    private static *entries(descriptors: Iterable<IServiceDescriptor>): Iterable<[ServiceIdentifier, IServiceDescriptor]> {
        for (const desc of descriptors) {
            yield [desc.serviceId, desc];
        }
    }
}
