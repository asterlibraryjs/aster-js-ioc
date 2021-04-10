import { Constructor } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";

/** Enumerate all available scopes */
export const enum ServiceLifetime {
    /** New instance injected on each context */
    transient,
    /** Will create new instance on each scope */
    scoped,
    /** Avalaible to current scope and all children */
    singleton
}

/** Enumerate all available scopes */
export const enum ServiceScope {
    /** The service is only available in current container */
    container = 0x1,

    /** The service is only available for children of current container */
    children = 0x2,

    /** The service is available for current container and its children */
    both = container | children
}

export interface ServiceOptions {
    /** Indicate whether or not the service instantiation can be delayed to avoid circular references problems */
    readonly delayed?: boolean;
    /**
     * Arguments pushed before service injection list
     * @example
     * new MyService(...baseArgs, ...serviceInjection)
    */
    readonly baseArgs?: any[];
    /**
     * Define whether or not the service is accessible to current container or / and its children
     * @default ServiceScope.both
     */
     readonly scope?: ServiceScope;
    }

export interface IServiceDescriptor {

    readonly serviceId: ServiceIdentifier;

    readonly lifetime: ServiceLifetime;

    readonly scope: ServiceScope;

    readonly targetType: Constructor;

    readonly ctor: Constructor;

    readonly baseArgs: readonly any[];

    readonly delayed: boolean;
}
