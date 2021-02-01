import { Constructor } from "@aster-js/core";

import { ServiceContract, ServiceFactoryConstructor, ServiceFactoryTag } from "../service-registry";
import { ServiceDescriptor } from "../service-descriptors";
import { ServiceCollection } from "../service-collection";

import { IServiceDescriptor, ServiceOptions, ServiceScope } from "./iservice-descriptor";
import { ServiceFactoryDescriptor } from "./service-factory-descriptor";

declare module "../service-collection/service-collection" {
    interface ServiceCollection {
        addScoped(ctor: Constructor, options?: ServiceOptions): this;
        addSingleton(ctor: Constructor, options?: ServiceOptions): this;
        addTransient(ctor: Constructor, options?: ServiceOptions): this;
    }
}

ServiceCollection.prototype.addScoped = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceScope.scoped, ctor, options)
    );
};

ServiceCollection.prototype.addSingleton = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceScope.singleton, ctor, options)
    );
}

ServiceCollection.prototype.addTransient = function (this: ServiceCollection, ctor: Constructor, options: ServiceOptions = {}) {
    return this.add(
        resolve(ServiceScope.transient, ctor, options)
    );
};

function resolve(scope: ServiceScope, ctor: Constructor, { baseArgs = [], delayed = false }: ServiceOptions): IServiceDescriptor {
    let serviceId = ServiceFactoryTag.get(ctor);
    if (serviceId) {
        return new ServiceFactoryDescriptor(scope, serviceId, ctor as ServiceFactoryConstructor, baseArgs, delayed);
    }
    serviceId = ServiceContract.resolve(ctor, true);
    return new ServiceDescriptor(scope, serviceId, ctor, baseArgs, delayed);
}