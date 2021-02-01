import { Constructor } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";

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
    }
}
