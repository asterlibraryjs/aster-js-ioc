import { Tags } from "@aster-js/core";
import { IServiceDescriptor } from "../service-descriptors";
import { DependencyParameter } from "../service-registry";
import { InstantiationContext } from "./instantiation-context";

import { ServiceProvider } from "./service-provider";

export interface IServiceDependency {
    readonly param: DependencyParameter;

    resolveArg(ctx?: InstantiationContext): any;

    entries(): Iterable<ServiceEntry>;
}

export class ServiceEntry {

    private constructor(readonly uid: string, readonly desc: IServiceDescriptor, readonly provider: ServiceProvider, readonly dependencies?: IServiceDependency[]) {
        this.uid = uid;
        this.desc = desc;
        this.provider = provider;
    }

    getScopeInstance(): any {
        return this.provider.getOwnInstance(this.desc);
    }

    withDependencies(dependencies: IServiceDependency[]): ServiceEntry {
        return new ServiceEntry(this.uid, this.desc, this.provider, dependencies);
    }

    static create(desc: IServiceDescriptor, provider: ServiceProvider): ServiceEntry {
        const uid = `${Tags.hashId(desc)}-${Tags.hashId(provider)}`;
        return new ServiceEntry(uid, desc, provider);
    }
}
