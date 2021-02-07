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
        return entry && this.createServiceCore(entry);
    }

    private createServiceCore(entry: ServiceEntry, instanciateDelayed?: boolean): any {
        if (!entry.desc.delayed || instanciateDelayed) {
            const ctx = this.instanciateDependencyGraph(entry);
            return ctx.getInstance(entry);
        }
        return this.createDelayedInstance(entry);
    }

    instanciateService(entry: ServiceEntry, ctx: InstanciationContext): void {
        if (ctx.target.uid === entry.uid) {
            const instance = this.createServiceInstance(entry, ctx);
            ctx.setInstance(entry, instance);
        }
        else {
            const instance = entry.provider.getScopeInstance(entry.desc);
            if (instance) {
                ctx.setInstance(entry, instance);
            }
            else {
                const instance = entry.desc.delayed
                    ? this.createDelayedInstance(entry)
                    : this.createServiceInstance(entry, ctx);
                ctx.setInstance(entry, instance);
            }
        }
    }

    private createDelayedInstance(entry: ServiceEntry): any {
        const lazyValue = new Lazy(() => this.createServiceCore(entry, true), entry.desc.ctor);
        const proxy = lazyValue.get();
        this.onInstanceCreated(entry.desc, proxy);
        return proxy;
    }


    private instanciateDependencyGraph(entry: ServiceEntry): InstanciationContext {
        const graph = this._dependencyResolver.resolveDependencyGraph(entry);

        const ctx = new InstanciationContext(entry);
        if (entry.desc.delayed) {
            const proxy = entry.provider.getScopeInstance(entry.desc);
            ctx.setInstance(entry, proxy);
        }

        for (const node of graph.nodes()) {
            if (node.desc.delayed && entry.uid !== node.uid) {
                this.instanciateDependency(node, ctx);
                graph.delete(node);
            }
        }

        for (const entry of graph) {
            this.instanciateDependency(entry, ctx);
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
            try {
                instance = factory.create();
                if (instance instanceof Promise) {
                    throw new Error(`ServiceFactory cannot return async results (${entry.desc.serviceId}`);
                }
            }
            finally {
                IDisposable.safeDispose(factory);
            }
        }

        this.onInstanceCreated(entry.desc, instance);
        return instance;
    }

    private onInstanceCreated(desc: IServiceDescriptor, instance: any): void {
        this._onDidServiceInstantiated.emit(desc, instance);
    }
}
