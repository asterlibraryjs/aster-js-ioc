import { IDisposable, Lazy, asserts, Constructor } from "@aster-js/core";
import { EventEmitter, IEvent } from "@aster-js/events";

import { IServiceFactory, ServiceContract, ServiceIdentifier } from "../service-registry";
import { IServiceDescriptor, ServiceFactoryDescriptor } from "../service-descriptors";

import { IDependencyResolver } from "./idependency-resolver";
import { IInstantiationService } from "./iinstantiation-service";
import { InstantiationContext } from "./instantiation-context";
import { ServiceEntry } from "./service-entry";
import { InstantiationError } from "./instantiation-error";

@ServiceContract(IInstantiationService)
export class InstantiationService implements IInstantiationService {
    private readonly _onDidServiceInstantiated: EventEmitter<[desc: IServiceDescriptor, instance: any]> = new EventEmitter();

    get onDidServiceInstantiated(): IEvent<[desc: IServiceDescriptor, instance: any]> { return this._onDidServiceInstantiated.event; }

    constructor(
        @IDependencyResolver private readonly _dependencyResolver: IDependencyResolver
    ) { }

    createService(desc: IServiceDescriptor): any {
        const entry = this._dependencyResolver.resolveEntry(desc);
        if (entry) {
            if (!entry.desc.delayed) {
                return this.createServiceCore(entry);
            }
            return this.createDelayedService(entry);
        }
    }

    private createServiceCore(entry: ServiceEntry): any {
        const ctx = this.instanciateDependencyGraph(entry);
        return ctx.getInstance(entry);
    }

    private createDelayedService(entry: ServiceEntry): any {
        const lazyValue = new Lazy(() => this.createServiceCore(entry), entry.desc.ctor);
        const proxy = lazyValue.get();
        this.onInstanceCreated(entry.desc, proxy);
        return proxy;
    }

    instanciateService(entry: ServiceEntry, ctx: InstantiationContext): void {
        const instance = entry.desc.delayed && ctx.target.uid !== entry.uid
            ? this.createDelayedService(entry)
            : this.createServiceInstance(entry, ctx);
        ctx.setInstance(entry, instance);
    }

    private instanciateDependencyGraph(entry: ServiceEntry): InstantiationContext {
        const graph = this._dependencyResolver.resolveDependencyGraph(entry);

        const ctx = new InstantiationContext(entry);

        const resolved = new Set();
        for (const node of graph.nodes()) {
            const instance = ServiceEntry.getScopeInstance(node);
            if (instance) {
                ctx.setInstance(node, instance);
                resolved.add(node);
            }
            else if (node.desc.delayed) {
                this.instanciateDependency(node, ctx);
                resolved.add(node);
            }
        }

        for (const node of graph) {
            if (resolved.has(node) && node.uid !== entry.uid) continue;
            this.instanciateDependency(node, ctx);
        }

        return ctx;
    }

    private instanciateDependency(entry: ServiceEntry, ctx: InstantiationContext): void {
        const instantiationSvc = entry.provider.get(IInstantiationService, true);
        instantiationSvc.instanciateService(entry, ctx);
    }

    private createServiceInstance(entry: ServiceEntry, ctx: InstantiationContext): any {
        asserts.defined(entry.dependencies);

        const dependencies = entry.dependencies.map(dep => dep.resolveArg(ctx));
        let instance = this.createInstance(entry.desc.serviceId, entry.desc.ctor, [...entry.desc.baseArgs, ...dependencies]);

        if (entry.desc instanceof ServiceFactoryDescriptor) {
            const factory = instance as IServiceFactory;

            const lazyValue = new Lazy(
                () => {
                    const instance = factory.create();
                    try {
                        if (instance instanceof Promise) {
                            throw new Error(`ServiceFactory cannot return async results (${entry.desc.serviceId}`);
                        }
                    }
                    finally {
                        IDisposable.safeDispose(factory);
                    }

                    this.onInstanceCreated(entry.desc, instance);
                    return instance;
                },
                entry.desc.targetType
            );

            instance = lazyValue.get();
        }

        this.onInstanceCreated(entry.desc, instance);
        return instance;
    }

    private createInstance(serviceId: ServiceIdentifier, ctor: Constructor, args: any[]): any {
        try {
            return new ctor(...args);
        }
        catch (err) {
            if(err instanceof Error){
                throw new InstantiationError(serviceId, err);
            }
            else{
                const wrap = new Error(String(err));
                throw new InstantiationError(serviceId, wrap);
            }
        }
    }

    private onInstanceCreated(desc: IServiceDescriptor, instance: any): void {
        this._onDidServiceInstantiated.emit(desc, instance);
    }
}
