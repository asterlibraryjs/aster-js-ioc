import { IDisposable, Lazy, asserts } from "@aster-js/core";
import { EventEmitter, IEvent } from "@aster-js/events";

import { IServiceFactory, ServiceContract } from "../service-registry";
import { IServiceDescriptor, ServiceFactoryDescriptor } from "../service-descriptors";

import { IDependencyResolver } from "./idependency-resolver";
import { IInstantiationService } from "./iinstantiation-service";
import { InstanciationContext } from "./instanciation-context";
import { ServiceEntry } from "./service-entry";

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

    instanciateService(entry: ServiceEntry, ctx: InstanciationContext): void {
        const instance = entry.desc.delayed && ctx.target.uid !== entry.uid
            ? this.createDelayedService(entry)
            : this.createServiceInstance(entry, ctx);
        ctx.setInstance(entry, instance);
    }

    private instanciateDependencyGraph(entry: ServiceEntry): InstanciationContext {
        const graph = this._dependencyResolver.resolveDependencyGraph(entry);

        const ctx = new InstanciationContext(entry);

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

    private instanciateDependency(entry: ServiceEntry, ctx: InstanciationContext): void {
        const instantiationSvc = entry.provider.get(IInstantiationService, true);
        instantiationSvc.instanciateService(entry, ctx);
    }

    private createServiceInstance(entry: ServiceEntry, ctx: InstanciationContext): any {
        asserts.defined(entry.dependencies);

        const dependencies = entry.dependencies.map(dep => dep.resolveArg(ctx));
        let instance = new entry.desc.ctor(...entry.desc.baseArgs, ...dependencies);

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

    private onInstanceCreated(desc: IServiceDescriptor, instance: any): void {
        this._onDidServiceInstantiated.emit(desc, instance);
    }
}
