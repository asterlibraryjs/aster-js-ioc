import { Constructor } from "@aster-js/core";
import { Iterables } from "@aster-js/iterators";

import { ServiceIdentifier, ServiceContract, ServiceUtilities } from "../service-registry";
import { IServiceCollection } from "../service-collection";
import { IServiceDescriptor, ServiceDescriptor, ServiceLifetime, ServiceScope } from "../service-descriptors";

import { IServiceProvider, } from "./iservice-provider";
import { IDependencyResolver } from "./idependency-resolver";
import { IInstantiationService } from "./iinstantiation-service";
import { InstantiationService } from "./instantiation-service";
import { DependencyResolver } from "./dependency-resolver";

@ServiceContract(IServiceProvider)
export class ServiceProvider implements IServiceProvider {
    private readonly _instances: Map<IServiceDescriptor, any>;
    private readonly _dependencyResolver: IDependencyResolver;
    private readonly _instanciationService: IInstantiationService;

    constructor(
        private readonly _services: IServiceCollection,
        private readonly _parent?: ServiceProvider
    ) {
        this._instances = new Map();
        this._dependencyResolver = this.createDependencyResolver();
        this._instanciationService = this.createInstanciationService();
        this._instanciationService.onDidServiceInstantiated(this.onDidServiceInstantiated, this);

        this.addCoreService(IDependencyResolver, this._dependencyResolver);
        this.addCoreService(IInstantiationService, this._instanciationService);
        this.addCoreService(IServiceProvider, this);
    }

    protected createDependencyResolver(): DependencyResolver {
        return new DependencyResolver(this);
    }

    protected createInstanciationService(): IInstantiationService {
        return new InstantiationService(this._dependencyResolver);
    }

    protected addCoreService<T extends Object>(serviceId: ServiceIdentifier<T>, instance: T): void {
        const desc = new ServiceDescriptor(serviceId, ServiceLifetime.scoped, ServiceScope.container, instance.constructor as Constructor, [], false);
        this._services.add(desc);
        this._instances.set(desc, instance);
    }

    protected onDidServiceInstantiated(desc: IServiceDescriptor, instance: any) {
        if (desc.lifetime !== ServiceLifetime.transient) {
            this._instances.set(desc, instance);
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

    parent(): ServiceProvider | undefined {
        return this._parent;
    }

    getOwnDescriptors(serviceId: ServiceIdentifier): Iterable<IServiceDescriptor> {
        return this._services.get(serviceId);
    }

    getOwnInstance(desc: IServiceDescriptor): any {
        return this._instances.get(desc);
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T> | IServiceDescriptor, required?: boolean): T | undefined;
    get<T>(descriptorOrId: ServiceIdentifier | IServiceDescriptor, required: boolean = false): T | undefined {
        // Owned descriptor
        if (ServiceIdentifier.is(descriptorOrId)) {
            const descriptors = this._services.get(descriptorOrId as ServiceIdentifier);

            const first = Iterables.first(descriptors);
            if (first) {
                return this.fetchOrCreateOwnInstance(first, required, true);
            }
        }
        else if (this._services.has(descriptorOrId)) {
            return this.fetchOrCreateOwnInstance(descriptorOrId as IServiceDescriptor, required, true);
        }

        // Not owned descriptor
        const entry = this._dependencyResolver.resolveEntry(descriptorOrId);
        if (entry) {
            return entry.provider.fetchOrCreateOwnInstance(entry.desc, required, false);
        }

        if (required) throw new Error(`No binding found for "${descriptorOrId}" from current scope.`);
    }

    *getAll<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T> {
        if (currentScopeOnly) {
            const descriptors = this._services.get(serviceId);
            yield* this.fetchOrCreateOwnInstances(descriptors);
        }
        else {
            for (const provider of this._dependencyResolver.resolveProviders(serviceId)) {
                yield* provider.getAll(serviceId, true);
            }
        }
    }

    protected fetchOrCreateOwnInstance<T>(descriptor: IServiceDescriptor, required: boolean, owned: boolean): T | undefined {
        if (ServiceUtilities.isAllowedScope(descriptor.scope, owned)) {
            const instance = this.getOwnInstance(descriptor);
            if (!instance) {
                return this._instanciationService.createService(descriptor);
            }
            return instance;
        }
        else if (required) {
            throw new Error(`Attempting to create an instance of service scoped to children only: "${descriptor}".`);
        }
    }

    protected *fetchOrCreateOwnInstances(descriptors: Iterable<IServiceDescriptor>): Iterable<any> {
        for (const descriptor of descriptors) {
            const instance = this.fetchOrCreateOwnInstance(descriptor, false, true);
            if (typeof instance !== "undefined") yield instance;
        }
    }
}
