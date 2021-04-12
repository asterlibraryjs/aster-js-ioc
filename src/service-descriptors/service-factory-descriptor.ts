import { Constructor } from "@aster-js/core";

import { ServiceFactoryConstructor, ServiceIdentifier } from "../service-registry";

import { IServiceDescriptor, ServiceLifetime, ServiceScope } from "./iservice-descriptor";

export class ServiceFactoryDescriptor implements IServiceDescriptor {

    readonly targetType: Constructor;

    constructor(
        readonly serviceId: ServiceIdentifier,
        readonly lifetime: ServiceLifetime,
        readonly scope: ServiceScope,
        readonly ctor: ServiceFactoryConstructor,
        readonly baseArgs: readonly any[],
        readonly delayed: boolean
    ) {
        this.targetType = ctor.targetType;
    }
}
