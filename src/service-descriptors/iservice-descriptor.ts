import { Constructor } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";
import { ServiceLifetime, ServiceScope } from "./scopes";



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
