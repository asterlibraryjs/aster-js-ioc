import { Constructor } from "@aster-js/core";

import { ServiceFactoryConstructor, ServiceIdentifier } from "../service-registry";

import { IServiceDescriptor, ServiceScope } from "./iservice-descriptor";

export class ServiceFactoryDescriptor implements IServiceDescriptor {

    readonly targetType: Constructor;

    constructor(
        readonly scope: ServiceScope,
        readonly serviceId: ServiceIdentifier,
        readonly ctor: ServiceFactoryConstructor,
        readonly baseArgs: readonly any[],
        readonly delayed: boolean
    ) {
        this.targetType = ctor.targetType;
    }
}

