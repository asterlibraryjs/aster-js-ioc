import { Constructor } from "@aster-js/core";

import { ServiceFactoryConstructor, ServiceFactoryTag } from "../service-registry/service-factory";
import { ServiceCollection } from "../service-collection/service-collection";

import { ServiceOptions } from "./iservice-descriptor";
import { ServiceLifetime, ServiceScope } from "./scopes";
import { ServiceFactoryDescriptor } from "./service-factory-descriptor";
import { ServiceIdentifier } from "../service-registry";

interface IServiceCollectionFactoryExtensions {
    addServiceFactory(lifetime: ServiceLifetime, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
    addServiceFactory(lifetime: ServiceLifetime, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
    addScopedFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    addScopedFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddScopedFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddScopedFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    addSingletonFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    addSingletonFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddSingletonFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddSingletonFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    addTransientFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    addTransientFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddTransientFactory(ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
    tryAddTransientFactory(servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): this;
}

declare module "../service-collection/service-collection" {
    interface ServiceCollection extends IServiceCollectionFactoryExtensions { }
}

function createServiceFactoryDescriptor(serviceId: ServiceIdentifier, lifetime: ServiceLifetime, ctor: ServiceFactoryConstructor, { baseArgs = [], delayed = false, scope = ServiceScope.both }: ServiceOptions) {
    return new ServiceFactoryDescriptor(serviceId, lifetime, scope, ctor, baseArgs, delayed);
}

function tryAddServiceInternal($this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    if (ServiceIdentifier.is(servicerIdOrCtor)) {
        if ($this.has(servicerIdOrCtor)) return $this;

        return $this.add(
            createServiceFactoryDescriptor(servicerIdOrCtor, lifetime, ctorOrOptions as ServiceFactoryConstructor, options ?? {})
        );
    }
    const serviceId = ServiceFactoryTag.get(servicerIdOrCtor);
    assertServiceFactoryId(serviceId);

    if ($this.has(serviceId)) return $this;

    return $this.add(
        createServiceFactoryDescriptor(serviceId, lifetime, servicerIdOrCtor as ServiceFactoryConstructor, ctorOrOptions as ServiceOptions ?? {})
    );
}

function addServiceInternal($this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: Constructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    if (ServiceIdentifier.is(servicerIdOrCtor)) {
        return $this.add(
            createServiceFactoryDescriptor(servicerIdOrCtor, lifetime, ctorOrOptions as ServiceFactoryConstructor, options ?? {})
        );
    }
    const serviceId = ServiceFactoryTag.get(servicerIdOrCtor);
    assertServiceFactoryId(serviceId);
    return $this.add(
        createServiceFactoryDescriptor(serviceId, lifetime, servicerIdOrCtor as ServiceFactoryConstructor, ctorOrOptions as ServiceOptions ?? {})
    );
}

function assertServiceFactoryId(serviceId: ServiceIdentifier | undefined): asserts serviceId is ServiceIdentifier {
    if (!serviceId) throw new Error("No service id attached to the provided factory. Use the @ServiceFactory decorator or provide explicitly the service id");
}

function addServiceFactory(this: ServiceCollection, lifetime: ServiceLifetime, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addServiceFactory(this: ServiceCollection, lifetime: ServiceLifetime, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addServiceFactory(this: ServiceCollection, lifetime: ServiceLifetime, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, lifetime, servicerIdOrCtor, ctorOrOptions, options);
}

function addScopedFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addScopedFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addScopedFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.scoped, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddScopedFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddScopedFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddScopedFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions) {
    return tryAddServiceInternal(this, ServiceLifetime.scoped, servicerIdOrCtor, ctorOrOptions, options);
}
function addSingletonFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addSingletonFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addSingletonFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.singleton, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddSingletonFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddSingletonFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddSingletonFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions) {
    return tryAddServiceInternal(this, ServiceLifetime.singleton, servicerIdOrCtor, ctorOrOptions, options);
}

function addTransientFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addTransientFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function addTransientFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions): ServiceCollection {
    return addServiceInternal(this, ServiceLifetime.transient, servicerIdOrCtor, ctorOrOptions, options);
}
function tryAddTransientFactory(this: ServiceCollection, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddTransientFactory(this: ServiceCollection, servicerId: ServiceIdentifier, ctor: ServiceFactoryConstructor, options?: ServiceOptions): ServiceCollection;
function tryAddTransientFactory(this: ServiceCollection, servicerIdOrCtor: ServiceIdentifier | ServiceFactoryConstructor, ctorOrOptions?: ServiceFactoryConstructor | ServiceOptions, options?: ServiceOptions) {
    return tryAddServiceInternal(this, ServiceLifetime.transient, servicerIdOrCtor, ctorOrOptions, options);
}


Object.assign(ServiceCollection.prototype, <IServiceCollectionFactoryExtensions>{
    addServiceFactory,
    addScopedFactory, tryAddScopedFactory,
    addSingletonFactory, tryAddSingletonFactory,
    addTransientFactory, tryAddTransientFactory
});
