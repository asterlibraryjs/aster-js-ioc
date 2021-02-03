import { IDisposable } from "@aster-js/core";

import { ServiceIdentifier } from "../service-registry";
import { IServiceDescriptor } from "../service-descriptors/iservice-descriptor";

export interface IServiceCollection extends IDisposable, Iterable<IServiceDescriptor> {
    readonly size: number;

    has(serviceIdOrDescriptor: ServiceIdentifier | IServiceDescriptor): boolean;

    get(serviceId: ServiceIdentifier): Iterable<IServiceDescriptor>;

    add(desc: IServiceDescriptor): this;

    delete(desc: IServiceDescriptor): this;
}
