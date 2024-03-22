import { Constructor } from "@aster-js/core";

import { ServiceFactoryConstructor, ServiceIdentifier } from "../service-registry";

import { IServiceDescriptor } from "./iservice-descriptor";
import { ServiceLifetime, ServiceScope } from "./scopes";

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
