import { Tag } from "@aster-js/core";
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
    const entryHashCode = Tag.lazy("ServiceEntryHashCode", (state) => ++state.lastId, { lastId: 0 });

    export function create(desc: IServiceDescriptor, provider: IServiceProvider) {
        const uid = `${entryHashCode.get(desc)}-${entryHashCode.get(provider)}`;
        return { uid, desc, provider };
    }
}