import { IDisposable, Constructor, Tag, asserts, Disposable } from "@aster-js/core";
import { Iterables } from "@aster-js/iterators";

import { ServiceIdentifier, ServiceRegistry, ServiceContract } from "../service-registry";
import { IServiceCollection, } from "../service-collection";
import { IServiceDescriptor, ServiceScope } from "../service-descriptors";

import { IServiceProvider, } from "./iservice-provider";
import "./service-provider-factory";
import { IDependencyResolver } from "./idependency-resolver";
import { IInstantiationService } from "./iinstantiation-service";
import { ServiceEntry } from "./service-entry";
import { EventArgs } from "@aster-js/events";

const _scope = Tag<string>("scope");
const _descriptor = Tag<IServiceDescriptor>("brand");

export interface ServiceInstance {
    readonly descriptor: IServiceDescriptor;
    readonly instance: object | undefined;
    setInstance(instance: unknown): void;
}

export namespace ServiceInstance {
    export const scope = _scope.readOnly();
    export const descriptor = _descriptor.readOnly();
}


/**
 * Provides methods to retrieve services and resolving dependencies
 */
@ServiceContract(IServiceProvider)
export class ServiceProvider implements IServiceProvider {
    private readonly _instances: Map<IServiceDescriptor, any>;

    constructor(
        private readonly _services: IServiceCollection,
        @IDependencyResolver private readonly _dependencyResolver: IDependencyResolver,
        @IInstantiationService private readonly _instanciationService: IInstantiationService
    ) {
        this._instances = new Map();
        this._instanciationService.onDidServiceInstantiated(this.onDidServiceInstantiated, this);
    }

    protected onDidServiceInstantiated({ detail }: EventArgs<[desc: IServiceDescriptor, instance: any]>) {
        if (detail[0].scope !== ServiceScope.transient) {
            this._instances.set(...detail);
        }
    }

    // resolve(ctor: Constructor): Constructor {
    //     const resolveArgs = (baseArgs: any[]) => this.resolveArgs(ctor, baseArgs);
    //     return class extends ctor {
    //         constructor(...baseArgs: any[]) {
    //             super(...resolveArgs(baseArgs));
    //             this.injectedCallback && this.injectedCallback();
    //         }
    //     } as Constructor;
    // }

    // resolveArgs(ctor: Constructor, baseArgs: ReadonlyArray<any>): ReadonlyArray<any> {
    //     const dependencies = [...this._dependencyResolver.resolveDependencies(ctor)];
    //     if (!dependencies.length) return baseArgs;

    //     const [first] = dependencies;
    //     if (baseArgs.length !== first.param.index) {
    //         throw new Error(`Invalid base arguments, expected ${first.param.index} arguments, provided ${baseArgs.length}`);
    //     }

    //     dependencies.map(d=> d.getDependencyEntries())

    //     return [...baseArgs, ];
    // }

    getScopeInstance(desc: IServiceDescriptor): any {
        return this._instances.get(desc);
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined {
        const descriptors = this._services.get(serviceId);

        const first = Iterables.first(descriptors);
        if (first) {
            return this.fetchOrCreateInstance(first);
        }

        const entry = this._dependencyResolver.resolveEntry(serviceId);

        asserts.defined(entry, `No binding found for "${serviceId}" from current scope.`);
        return entry.provider.get(serviceId, required);
    }

    *getAll<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T> {
        if (currentScopeOnly) {
            const descriptors = this._services.get(serviceId);
            return this.fetchOrCreateInstances(descriptors);
        }
        else{
            for (const provider of this._dependencyResolver.resolveProviders(serviceId)) {
                yield* provider.getAll(serviceId, true);
            }
        }
    }

    protected fetchOrCreateInstance(descriptor: IServiceDescriptor): any {
        const instance = this.getScopeInstance(descriptor);
        if (!instance) {
            const entry = ServiceEntry.create(this, descriptor);
            return this._instanciationService.createService(entry);
        }
        return instance;
    }

    protected *fetchOrCreateInstances(descriptors: Iterable<IServiceDescriptor>): Iterable<any> {
        for (const descriptor of descriptors) {
            yield* this.fetchOrCreateInstance(descriptor);
        }
    }
}
