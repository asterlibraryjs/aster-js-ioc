import { Constructor } from "@aster-js/core";
import { Iterables } from "@aster-js/iterators";

import { ServiceIdentifier } from "../service-registry";

import { IServiceDescriptor } from "./iservice-descriptor";
import { ServiceLifetime, ServiceScope } from "./scopes";

export class ServiceDescriptor implements IServiceDescriptor {

    readonly targetType: Constructor;

    constructor(
        readonly serviceId: ServiceIdentifier,
        readonly lifetime: ServiceLifetime,
        readonly scope: ServiceScope,
        readonly ctor: Constructor,
        readonly baseArgs: readonly any[],
        readonly delayed: boolean
    ) {
        this.targetType = ctor;
        this.validateArgs();
    }

    private validateArgs(): void {
        const dependencies = ServiceIdentifier.registry.dependencies(this.targetType);
        const first = Iterables.first(dependencies);
        if(first){
            if(first.index > this.baseArgs.length)  {
                throw new Error(`Not enough arguments provided for service binding ${this.serviceId}. Provided: ${this.baseArgs.length}, Expected: ${first.index}`);
            }
            if(first.index < this.baseArgs.length) {
                throw new Error(`Too much arguments provided for service binding ${this.serviceId}. Provided: ${this.baseArgs.length}, Expected: ${first.index}`);
            }
        }
    }
}
