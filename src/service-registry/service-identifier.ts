import { Constructor, Tag } from "@aster-js/core";

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
