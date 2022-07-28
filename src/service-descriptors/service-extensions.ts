import { Constructor } from "@aster-js/core";

import { ServiceContract } from "../service-registry/service-contract";
import { ServiceDescriptor } from "./service-descriptor";
import { ServiceCollection } from "../service-collection/service-collection";

import { ServiceOptions, ServiceLifetime, ServiceScope } from "./iservice-descriptor";
import { ServiceIdentifier } from "../service-registry";

interface IServiceCollectionExtensions {
    addService(lifetime: ServiceLifetime, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
    addService(lifetime: ServiceLifetime, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
    addScoped(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    addScoped(ctor: Constructor, options?: ServiceOptions): this;
    tryAddScoped(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    tryAddScoped(ctor: Constructor, options?: ServiceOptions): this;
    addSingleton(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    addSingleton(ctor: Constructor, options?: ServiceOptions): this;
    tryAddSingleton(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    tryAddSingleton(ctor: Constructor, options?: ServiceOptions): this;
    addTransient(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    addTransient(ctor: Constructor, options?: ServiceOptions): this;
    tryAddTransient(servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): this;
    tryAddTransient(ctor: Constructor, options?: ServiceOptions): this;
}

declare module "../service-collection/service-collection" {
    interface ServiceCollection extends IServiceCollectionExtensions { }
}

function createServiceDescriptor(serviceId: ServiceIdentifier, lifetime: ServiceLifetime, ctor: Constructor, { baseArgs = [], delayed = false, scope = ServiceScope.both }: ServiceOptions) {
    return new ServiceDescriptor(serviceId, lifetime, scope, ctor, baseArgs, delayed);
}

function tryAddServiceInternal($this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    if (ServiceIdentifier.is(servicerIdOrCtor)) {
        if ($this.has(servicerIdOrCtor)) return $this;

        return $this.add(
            createServiceDescriptor(servicerIdOrCtor, lifetime, ctorOrOptions as Constructor, options ?? {})
        );
    }
    const serviceId = ServiceContract.resolve(servicerIdOrCtor);
    if ($this.has(serviceId)) return $this;

    return $this.add(
        createServiceDescriptor(serviceId, lifetime, servicerIdOrCtor as Constructor, ctorOrOptions as ServiceOptions ?? {})
    );
}

function addServiceInternal($this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    if (ServiceIdentifier.is(servicerIdOrCtor)) {
        return $this.add(
            createServiceDescriptor(servicerIdOrCtor, lifetime, ctorOrOptions as Constructor, options ?? {})
        );
    }
    const serviceId = ServiceContract.resolve(servicerIdOrCtor);
    return $this.add(
        createServiceDescriptor(serviceId, lifetime, servicerIdOrCtor as Constructor, ctorOrOptions as ServiceOptions ?? {})
    );
}

function addService(this: ServiceCollection, lifetime: ServiceLifetime, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addService(this: ServiceCollection, lifetime: ServiceLifetime, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addService(this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, lifetime, servicerIdOrCtor, ctorOrOptions, options);
}

function addScoped(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addScoped(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addScoped(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.scoped, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddScoped(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddScoped(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddScoped(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return tryAddServiceInternal(this, ServiceLifetime.scoped, servicerIdOrCtor, ctorOrOptions, options);
}
function addSingleton(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addSingleton(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addSingleton(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.singleton, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddSingleton(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddSingleton(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddSingleton(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return tryAddServiceInternal(this, ServiceLifetime.singleton, servicerIdOrCtor, ctorOrOptions, options);
}
function addTransient(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addTransient(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function addTransient(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.transient, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddTransient(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddTransient(this: ServiceCollection, ctor: Constructor, options?: ServiceOptions): ServiceCollection;
function tryAddTransient(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | Constructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return tryAddServiceInternal(this, ServiceLifetime.transient, servicerIdOrCtor, ctorOrOptions, options);
}

Object.assign(ServiceCollection.prototype, <IServiceCollectionExtensions>{
    addService,
    addScoped, tryAddScoped,
    addSingleton, tryAddSingleton,
    addTransient, tryAddTransient
});
