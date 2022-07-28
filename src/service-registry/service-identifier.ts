import { Constructor, Tag } from "@aster-js/core";

import { ServiceRegistry } from "./service-registry";

const serviceIdentityTag = Tag<string | symbol | Constructor>("IoC/ServiceId");
export const ServiceIdentityTag = serviceIdentityTag.readOnly();

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
    const hashValue = options.unique ? options.name : Symbol(options.name);
    return create(hashValue, options);
}

export namespace ServiceIdentifier {
    export const registry = new ServiceRegistry(of, ServiceIdentityTag);
    /**
     * Returns a new service identifier for a specific type
     *
     * This method will strongly bind implementation to a specific type
     */
    export function of<T = any>(ctor: Constructor<T>): ServiceIdentifier<T> {
        return create(ctor, { name: ctor.name });
    }

    /** Check wether or not the provided object is a ServiceIdentifier */
    export function is<T = any>(target: any): target is ServiceIdentifier<T> {
        return serviceIdentityTag.has(target);
    }
}

function create<T>(tag: string | symbol | Constructor, options: ServiceIdentifierOptions): ServiceIdentifier<T> {
    const id = <ServiceIdentifier<T>>((target: Constructor, _: string | symbol, index: number) => {
        ServiceIdentifier.registry.addDependency(target, id, index, "required");
    });

    serviceIdentityTag.set(id, tag);

    Object.assign(id, createImpl(id, options));
    ServiceIdentifier.registry.add(id, options);

    return id;
}

function createImpl<T>(id: ServiceIdentifier, options: ServiceIdentifierOptions): ServiceIdentifierImpl<T> {
    return {
        toString: () => options.name
    };
}
