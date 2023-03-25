import { Constructor } from "@aster-js/core";

import { ServiceContract } from "../service-registry/service-contract";
import { IServiceFactory, ServiceFactoryConstructor, ServiceFactoryTag } from "../service-registry/service-factory";
import { ServiceCollection } from "../service-collection/service-collection";

import { ServiceOptions, ServiceLifetime, ServiceScope } from "./iservice-descriptor";
import { ServiceFactoryDescriptor } from "./service-factory-descriptor";
import { resolveServiceId, ServiceIdentifier } from "../service-registry";

interface IServiceCollectionInstanceExtensions {
    /** Add the provided instance as a singleton */
    addInstance(instance: any, options?: ServiceOptions): ServiceCollection;
    /** Add the provided instance as a singleton */
    addInstance(serviceId: ServiceIdentifier, instance: any, options?: ServiceOptions): ServiceCollection;
}

declare module "../service-collection/service-collection" {
    interface ServiceCollection extends IServiceCollectionInstanceExtensions { }
}


function addInstance(this: ServiceCollection, instance: any, options?: Omit<ServiceOptions, "baseArgs">): ServiceCollection;
function addInstance(this: ServiceCollection, serviceId: ServiceIdentifier, instance: any, options?: Omit<ServiceOptions, "baseArgs">): ServiceCollection;
function addInstance(this: ServiceCollection, servicerIdOrInstance: any, instanceOrOptions?: any, options: Omit<ServiceOptions, "baseArgs"> = {}) {
    let instance: any;
    let serviceId: ServiceIdentifier;
    if (ServiceIdentifier.is(servicerIdOrInstance)) {
        serviceId = servicerIdOrInstance;
        instance = instanceOrOptions;
    }
    else {
        instance = servicerIdOrInstance;
        serviceId = resolveServiceId(instance.constructor);
    }

    const { delayed = false, scope = ServiceScope.both } = options;

    class CustomInstanceServiceFactory implements IServiceFactory {
        static readonly targetType: Constructor = instance.constructor;
        create(): any { return instance; }
    }

    const desc = new ServiceFactoryDescriptor(
        serviceId,
        ServiceLifetime.singleton,
        scope,
        CustomInstanceServiceFactory,
        [],
        delayed
    );
    return this.add(desc);
}

Object.assign(ServiceCollection.prototype, <IServiceCollectionInstanceExtensions>{
    addInstance
});
