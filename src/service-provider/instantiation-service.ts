import { IDisposable, Lazy, asserts } from "@aster-js/core";

import { IServiceFactory, ServiceContract } from "../service-registry";
import { IServiceDescriptor, ServiceFactoryDescriptor } from "../service-descriptors";

import { IDependencyResolver } from "./idependency-resolver";
import { EventEmitter, IEvent } from "@aster-js/events";
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
            const ctx = this.instanciateDependencyGraph(entry);
            return ctx.getInstance(entry);
        }
    }

    instanciateService(entry: ServiceEntry, ctx: InstanciationContext): void {
        const instance = entry.provider.getScopeInstance(entry.desc);
        if (instance) {
            ctx.setInstance(entry, instance);
        }
        else {
            entry.desc.delayed
                ? this.instanciateDelayedService(entry, ctx)
                : this.instanciateServiceCore(entry, ctx);
        }
    }

    private instanciateDependencyGraph(entry: ServiceEntry): InstanciationContext {
        const graph = this._dependencyResolver.resolveDependencyGraph(entry);
        const ctx = new InstanciationContext(graph);

        for (const entry of ctx.entries()) {
            const instantiationSvc = entry.provider.get(IInstantiationService, true);
            instantiationSvc.instanciateService(entry, ctx);
        }

        return ctx;
    }

    private instanciateDelayedService(entry: ServiceEntry, ctx: InstanciationContext): any {
        const lazyValue = new Lazy(() => {
            this.instanciateServiceCore(entry, ctx);
            return ctx.getInstance(entry)
        }, entry.desc.ctor);

        const proxy = lazyValue.get();
        ctx.setInstance(entry, proxy);
        this.onInstanceCreated(entry.desc, proxy);
    }

    private instanciateServiceCore(entry: ServiceEntry, ctx: InstanciationContext): void {
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

        ctx.setInstance(entry, instance);
        this.onInstanceCreated(entry.desc, instance);
    }

    private onInstanceCreated(desc: IServiceDescriptor, instance: any): void {
        this._onDidServiceInstantiated.trigger([desc, instance]);
    }
}
