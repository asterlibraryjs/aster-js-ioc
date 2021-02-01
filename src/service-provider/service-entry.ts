import { Disposable, DisposedError, IDisposable } from "@aster-js/core";
import { IServiceDescriptor } from "../service-descriptors";
import { DependencyParameter } from "../service-registry";
import { InstanciationContext } from "./instanciation-context";

import { IServiceProvider, } from "./iservice-provider";
import "./service-provider-factory";

export interface IServiceDependency {
    readonly param: DependencyParameter;

    getDependencyArg(ctx: InstanciationContext): any;

    getDependencyEntries(): Iterable<ServiceEntry>;
}

export class ServiceEntry extends Disposable {
    private static _instances = new WeakMap<IServiceProvider, Map<IServiceDescriptor, ServiceEntry>>();
    private static _lastId = 0;

    private readonly _uid: number;
    private readonly _desc: IServiceDescriptor;
    private _provider?: IServiceProvider;
    private _dependencies?: IServiceDependency[];

    get uid(): number { return this._uid; }

    get desc(): IServiceDescriptor { return this._desc; }

    get provider(): IServiceProvider {
        if (!this._provider) throw new DisposedError();
        return this._provider;
    }

    protected constructor(uid: number, desc: IServiceDescriptor, provider: IServiceProvider) {
        super();
        this._uid = uid;
        this._provider = provider;
        this._desc = desc;
    }

    *getDependencies(): Iterable<IServiceDependency> {
        if (!this._dependencies) throw new Error("Dependencies had never be resolved on the service entry");
        yield* this._dependencies;
    }

    setDependencies(dependencies: IServiceDependency[]): void {
        this._dependencies = [...dependencies];
    }

    protected dispose(): void {
        delete this._provider;
        delete this._dependencies;
    }

    static create(provider: IServiceProvider, desc: IServiceDescriptor, dependencies?: IServiceDependency[]): ServiceEntry {
        const map = this.getRegistrationMap(provider);

        let entry = map.get(desc);
        if (!entry) {
            entry = new ServiceEntry(++this._lastId, desc, provider);
            entry.registerForDispose(
                IDisposable.create(() => map.delete(desc))
            );
            map.set(desc, entry);
        }

        if (dependencies) {
            entry.setDependencies(dependencies);
        }

        return entry;
    }

    private static getRegistrationMap(provider: IServiceProvider): Map<IServiceDescriptor, ServiceEntry> {
        let map = this._instances.get(provider);
        if (!map) {
            map = new Map();
            this._instances.set(provider, map);
        }
        return map;
    }
}