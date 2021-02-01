import { Constructor } from "@aster-js/core";
import { TopologicalGraph, Iterables } from "@aster-js/iterators";

import { DependencyParameter, ServiceContract, ServiceIdentifier, ServiceRegistry } from "../service-registry";
import { IServiceCollection, } from "../service-collection";
import { IServiceDescriptor, ServiceScope } from "../service-descriptors";

import { IServiceProvider, } from "./iservice-provider";
import "./service-provider-factory";
import { IDependencyResolver } from "./idependency-resolver";
import { IServiceDependency, ServiceEntry } from "./service-entry";
import { MultipleServiceDependency, EmptyServiceDependency, SingleServiceDependency } from "./dependency-entry";

@ServiceContract(IDependencyResolver)
export class DependencyResolver implements IDependencyResolver {

    constructor(
        private readonly _services: IServiceCollection,
        private readonly _parent: DependencyResolver | undefined,
        @IServiceProvider private readonly _serviceProvider: IServiceProvider
    ) { }

    *resolveProviders(serviceId: ServiceIdentifier): Iterable<IServiceProvider> {
        for (const svc of Iterables.create(this, () => this._parent)) {
            if (svc._services.has(serviceId)) {
                yield svc._serviceProvider;
            }
        }
    }

    resolveEntry(serviceId: ServiceIdentifier): ServiceEntry | undefined {
        const all = this.resolveEntries(serviceId);
        return Iterables.first(all);
    }

    *resolveEntries(serviceId: ServiceIdentifier): Iterable<ServiceEntry> {
        for (const svc of Iterables.create(this, () => this._parent)) {
            for (const desc of svc._services.get(serviceId)) {
                if (svc === this || desc.scope !== ServiceScope.scoped) {
                    yield ServiceEntry.create(svc._serviceProvider, desc);
                }
            }
        }
    }

    *resolveDependencies(ctor: Constructor): Iterable<IServiceDependency> {
        for (const param of ServiceRegistry.dependencies(ctor)) {
            if (param.type === "many") {
                const entries = this.resolveEntries(param.serviceId);
                yield new MultipleServiceDependency(param, entries)
            }
            else {
                const found = this.resolveEntry(param.serviceId);
                if (found) {
                    yield new SingleServiceDependency(param, found);
                }
                else if (param.type === "required") {
                    throw new Error(`No service named "${param.serviceId}" registered`);
                }
                else {
                    yield new EmptyServiceDependency(param);
                }
            }
        }
    }

    resolveDependencyGraph(entry: ServiceEntry): TopologicalGraph<ServiceEntry> {
        const graph = new TopologicalGraph<ServiceEntry>(entry => entry.uid);

        let count = 0;
        const stack: ServiceEntry[] = [entry];
        do {
            if (count++ > 100) throw new Error(`Stackoverflow: Cyclic dependency between services.`);

            const entry = stack.pop()!;

            // Get the dependency resolver from the scope of the service
            const dependencyResolver = entry.provider.get(IDependencyResolver, true);

            const dependencies = [...dependencyResolver.resolveDependencies(entry.desc.ctor)];

            const serviceEntries = dependencies.flatMap(dep => [...dep.getDependencyEntries()])
                .filter(e => {
                    return !e.provider.getScopeInstance(e.desc) && !graph.has(e)
                });

            entry.setDependencies(dependencies);
            graph.add(entry, ...serviceEntries);
            stack.push(...serviceEntries);
        }
        while (stack.length);

        return graph;
    }
}
