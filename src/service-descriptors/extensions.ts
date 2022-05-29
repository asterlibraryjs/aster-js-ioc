import { Constructor } from "@aster-js/core";

import { ServiceContract } from "../service-registry/service-contract";
import { ServiceFactoryConstructor, ServiceFactoryTag } from "../service-registry/service-factory";
import { ServiceDescriptor } from "../service-descriptors/service-descriptor";
import { ServiceCollection } from "../service-collection/service-collection";

import { IServiceDescriptor, ServiceOptions, ServiceLifetime, ServiceScope } from "./iservice-descriptor";
import { ServiceFactoryDescriptor } from "./service-factory-descriptor";

declare module "../service-collection/service-collection" {
    interface ServiceCollection {
        addScoped(ctor: Constructor, options?: ServiceOptions): this;
        tryAddScoped(ctor: Constructor, options?: ServiceOptions): this;
        addSingleton(ctor: Constructor, options?: ServiceOptions): this;
        tryAddSingleton(ctor: Constructor, options?: ServiceOptions): this;
        addTransient(ctor: Constructor, options?: ServiceOptions): this;
        tryAddTransient(ctor: Constructor, options?: ServiceOptions): this;
    }
}

ServiceCollection.prototype.addScoped = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceLifetime.scoped, ctor, options)
    );
};


ServiceCollection.prototype.tryAddScoped = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    const desc = resolve(ServiceLifetime.scoped, ctor, options);
    if (!this.has(desc.serviceId)) {
        return this.add(desc);
    }
    return this;
};

ServiceCollection.prototype.addSingleton = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceLifetime.singleton, ctor, options)
    );
}

ServiceCollection.prototype.tryAddSingleton = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    const desc = resolve(ServiceLifetime.singleton, ctor, options);
    if (!this.has(desc.serviceId)) {
        return this.add(desc);
    }
    return this;
}

ServiceCollection.prototype.addTransient = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceLifetime.transient, ctor, options)
    );
};

ServiceCollection.prototype.tryAddTransient = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    const desc = resolve(ServiceLifetime.transient, ctor, options);
    if (!this.has(desc.serviceId)) {
        return this.add(desc);
    }
    return this;
};

function resolve(lifetime: ServiceLifetime, ctor: Constructor, { baseArgs = [], delayed = false, scope = ServiceScope.both }: ServiceOptions): IServiceDescriptor {
    let serviceId = ServiceFactoryTag.get(ctor);
    if (serviceId) {
        return new ServiceFactoryDescriptor(serviceId, lifetime, scope, ctor as ServiceFactoryConstructor, baseArgs, delayed);
    }
    serviceId = ServiceContract.resolve(ctor);
    return new ServiceDescriptor(serviceId, lifetime, scope, ctor, baseArgs, delayed);

}
