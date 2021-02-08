import { Tags } from "@aster-js/core";
import { IServiceDescriptor } from "../service-descriptors";
import { DependencyParameter } from "../service-registry";
import { InstanciationContext } from "./instanciation-context";

import { IServiceProvider, } from "./iservice-provider";

export interface IServiceDependency {
    readonly param: DependencyParameter;

    resolveArg(ctx?: InstanciationContext): any;

    entries(): Iterable<ServiceEntry>;
}

export type ServiceEntry = {

    readonly uid: string;

    readonly desc: IServiceDescriptor;

    readonly provider: IServiceProvider;

    readonly dependencies?: IServiceDependency[];
}

export namespace ServiceEntry {
    export function create(desc: IServiceDescriptor, provider: IServiceProvider): ServiceEntry {
        const uid = `${Tags.hashId(desc)}-${Tags.hashId(provider)}`;
        return { uid, desc, provider };
    }
    export function getScopeInstance({ desc, provider }: ServiceEntry): any {
        return provider.getScopeInstance(desc);
    }
}