import { Constructor } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";

/** Enumerate all available scopes */
export enum ServiceScope {
    /** New instance injected on each context */
    transient,
    /** Limited to current scope */
    scoped,
    /** Avalaible to current scope and all children */
    singleton
}

export interface ServiceOptions {
    /** Indicate whether or not the service instantiation can be delayed to avoid circular references problems */
    delayed?: boolean;
    /**
     * Arguments pushed before service injection list
     * @example
     * new MyService(...baseArgs, ...serviceInjection)
    */
    baseArgs?: any[];
}

export interface IServiceDescriptor {

    readonly scope: ServiceScope;
    
    readonly serviceId: ServiceIdentifier;

    readonly targetType: Constructor;

    readonly ctor: Constructor;

    readonly baseArgs: readonly any[];

    readonly delayed: boolean;
}