import { Constructor } from "@aster-js/core";
import { Iterables } from "@aster-js/iterators";

import { ServiceIdentifier, ServiceRegistry } from "../service-registry";

import { IServiceDescriptor, ServiceScope } from "./iservice-descriptor";

export class ServiceDescriptor implements IServiceDescriptor {

    readonly targetType: Constructor;

    constructor(
        readonly scope: ServiceScope,
        readonly serviceId: ServiceIdentifier,
        readonly ctor: Constructor,
        readonly baseArgs: readonly any[],
        readonly delayed: boolean
    ) {
        this.targetType = ctor;
        this.validateArgs();
    }

    private validateArgs(): void {
        const dependencies = ServiceRegistry.dependencies(this.targetType);
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
