import { Constructor } from "@aster-js/core";
import { Iterables } from "@aster-js/iterators";

import { ServiceIdentifier, ServiceContract, ServiceIdentityTag } from "../service-registry";
import { IServiceCollection, } from "../service-collection";
import { IServiceDescriptor, ServiceDescriptor, ServiceScope } from "../service-descriptors";

import { IServiceProvider, } from "./iservice-provider";
import { IDependencyResolver } from "./idependency-resolver";
import { IInstantiationService } from "./iinstantiation-service";
import { EventArgs } from "@aster-js/events";
import { InstantiationService } from "./instantiation-service";
import { DependencyResolver } from "./dependency-resolver";

@ServiceContract(IServiceProvider)
export class ServiceProvider implements IServiceProvider {
    private readonly _instances: Map<IServiceDescriptor, any>;
    private readonly _dependencyResolver: IDependencyResolver;
    private readonly _instanciationService: IInstantiationService;

    constructor(
        private readonly _services: IServiceCollection,
        private readonly _parent?: IServiceProvider
    ) {
        this._instances = new Map();
        this._dependencyResolver = this.createDependencyResolver();
        this._instanciationService = this.createInstanciationService();
        this._instanciationService.onDidServiceInstantiated(this.onDidServiceInstantiated, this);
    }

    protected createDependencyResolver(): DependencyResolver {
        const desc = new ServiceDescriptor(ServiceScope.scoped, IDependencyResolver, DependencyResolver, [], false);
        this._services.add(desc);

        const svc = new DependencyResolver(this);
        this._instances.set(desc, svc);
        return svc;
    }

    protected createInstanciationService(): IInstantiationService {
        const desc = new ServiceDescriptor(ServiceScope.scoped, IInstantiationService, InstantiationService, [], false);
        this._services.add(desc);

        const svc = new InstantiationService(this._dependencyResolver);
        this._instances.set(desc, svc);
        return svc;
    }

    protected onDidServiceInstantiated({ detail }: EventArgs<[desc: IServiceDescriptor, instance: any]>) {
        if (detail[0].scope !== ServiceScope.transient) {
            this._instances.set(...detail);
        }
    }

    createInstance<T>(ctor: Constructor<T>, ...baseArgs: ReadonlyArray<any>): T {
        const args = this.resolveArgs(ctor, baseArgs);
        return new ctor(...args);
    }

    resolve(ctor: Constructor): Constructor {
        const resolveArgs = (baseArgs: any[]) => this.resolveArgs(ctor, baseArgs);
        return class extends ctor {
            constructor(...baseArgs: any[]) {
                super(...resolveArgs(baseArgs));
                this.injectedCallback && this.injectedCallback();
            }
        } as Constructor;
    }

    private resolveArgs(ctor: Constructor, baseArgs: ReadonlyArray<any>): ReadonlyArray<any> {
        const dependencies = [...this._dependencyResolver.resolveDependencies(ctor)];
        if (!dependencies.length) return baseArgs;

        const [first] = dependencies;
        if (baseArgs.length !== first.param.index) {
            throw new Error(`Invalid base arguments, expected ${first.param.index} arguments, provided ${baseArgs.length}`);
        }

        return [...baseArgs, ...dependencies.map(d => d.resolveArg())];
    }

    parent(): IServiceProvider | undefined {
        return this._parent;
    }

    getScopeDescriptors(serviceId: ServiceIdentifier): Iterable<IServiceDescriptor> {
        return this._services.get(serviceId);
    }

    getScopeInstance(desc: IServiceDescriptor): any {
        return this._instances.get(desc);
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T> | IServiceDescriptor, required?: boolean): T | undefined;
    get<T>(descriptorOrId: ServiceIdentifier | IServiceDescriptor, required?: boolean): T | undefined {
        if (ServiceIdentityTag.has(descriptorOrId)) {
            const descriptors = this._services.get(descriptorOrId as ServiceIdentifier);

            const first = Iterables.first(descriptors);
            if (first) {
                return this.fetchOrCreateInstance(first);
            }
        }
        else if (this._services.has(descriptorOrId)) {
            return this.fetchOrCreateInstance(descriptorOrId as IServiceDescriptor);
        }
        const entry = this._dependencyResolver.resolveEntry(descriptorOrId);

        if (entry) {
            return entry.provider.get(descriptorOrId, required);
        }

        if (required) throw new Error(`No binding found for "${descriptorOrId}" from current scope.`);
    }

    *getAll<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T> {
        if (currentScopeOnly) {
            const descriptors = this._services.get(serviceId);
            return this.fetchOrCreateInstances(descriptors);
        }
        else {
            for (const provider of this._dependencyResolver.resolveProviders(serviceId)) {
                yield* provider.getAll(serviceId, true);
            }
        }
    }

    protected fetchOrCreateInstance(descriptor: IServiceDescriptor): any {
        const instance = this.getScopeInstance(descriptor);
        if (!instance) {
            return this._instanciationService.createService(descriptor);
        }
        return instance;
    }

    protected *fetchOrCreateInstances(descriptors: Iterable<IServiceDescriptor>): Iterable<any> {
        for (const descriptor of descriptors) {
            yield* this.fetchOrCreateInstance(descriptor);
        }
    }
}
