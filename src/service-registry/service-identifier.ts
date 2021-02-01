import { asserts, Constructor, Tag } from "@aster-js/core";

import { IServiceAccessor } from "../service-provider";

import { IServiceFactory, ServiceFactoryConstructor, ServiceFactoryDelegate } from "./service-factory";
import { ServiceRegistry } from "./service-registry";

const serviceIdentityTag = Tag<string | symbol>("IoC/ServiceId");
const childrenIdentityTag = Tag<ServiceIdentifier[]>("IoC/childrenIdentityTag");
export const ServiceIdentityTag = serviceIdentityTag.readOnly();
export const ChildrenIdentityTag = childrenIdentityTag.readOnly();

export interface ServiceIdentifierOptions {
    readonly name: string;
    /**
     * Indicate whether or not this identity name should be unique or not.
     * 
     * If false, a Symbol is used as key, but symbols can't be shared/resolved between different bundle / modules.
     * 
     * If true, the name is used as key and the service key can be shared/resolved through multiple bundles / modules.
     */
    readonly unique?: boolean;
}

export interface ServiceIdentifier<T = any> extends ServiceIdentifierDecorator, ServiceIdentifierImpl<T> { }

export interface ServiceIdentifierDecorator {
    (...args: any[]): void;
}

export interface ServiceIdentifierImpl<T> {
    /**
     * Create a factory that will return an existing instance
     * @param instance Service instance
     */
    factory(instance: T): ServiceFactoryConstructor<T>;
    /**
     * Create a factory for current ServiceId
     * @param callback Callback factory
     * @param targetType (Recommanded) Expected type, this may help internal logic to provide more detail on the implementation before its creation
     */
    factory(callback: (acc: IServiceAccessor) => T, targetType?: Constructor<T>): ServiceFactoryConstructor<T>;
    /** Returns a new child service identifier to enable groups */
    createChild(): ServiceIdentifier<T>;
    /** Returns the registration name */
    toString(): string;
}

export function ServiceIdentifier<T>(nameOrOptions: string | ServiceIdentifierOptions): ServiceIdentifier<T> {
    const options = typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;

    const id = <ServiceIdentifier<T>>((target: Constructor, _: string | symbol, index: number) => {
        ServiceRegistry.addDependency(target, id, index, "required");
    });

    const hashValue = options.unique ? options.name : Symbol(options.name);
    serviceIdentityTag.set(id, hashValue);

    Object.assign(id, createImpl(id, options));

    return id;
}

function createImpl<T>(id: ServiceIdentifier, options: ServiceIdentifierOptions): ServiceIdentifierImpl<T> {
    return {
        factory: (callbackOrInstance: T | ServiceFactoryDelegate<T>, targetType?: Constructor<T>) => {
            if (typeof callbackOrInstance === "function") {
                const callback = callbackOrInstance as ServiceFactoryDelegate<T>;
                return IServiceFactory.create(id, callback, targetType);
            }
            const instance = callbackOrInstance as any;
            return IServiceFactory.create(id, () => instance, instance.constructor);
        },
        createChild: () => {
            const children = childrenIdentityTag.get(id);
            asserts.ensure(children);

            const childId = ServiceIdentifier<T>(options.name);
            children.push(childId);
            return childId;
        },
        toString: () => options.name
    };
}

export function Optional(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        ServiceRegistry.addDependency(target, serviceId, index, "optional");
    };
}

export function Many(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        ServiceRegistry.addDependency(target, serviceId, index, "many");
    };
}
