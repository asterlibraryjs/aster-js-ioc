import { Constructor } from "@aster-js/core";
import { TopologicalGraph, Iterables } from "@aster-js/iterators";

import { ServiceContract, ServiceIdentifier, isAllowedScope } from "../service-registry";
import { IServiceDescriptor, ServiceLifetime } from "../service-descriptors";

import { IDependencyResolver } from "./idependency-resolver";
import { IServiceDependency, ServiceEntry } from "./service-entry";
import { MultipleServiceDependency, EmptyServiceDependency, SingleServiceDependency, OptionsServiceDependency } from "./dependency-entry";
import { ServiceProvider } from "./service-provider";

@ServiceContract(IDependencyResolver)
export class DependencyResolver implements IDependencyResolver {

    constructor(
        private readonly _serviceProvider: ServiceProvider
    ) { }

    *resolveProviders(serviceId: ServiceIdentifier): Iterable<ServiceProvider> {
        for (const svc of Iterables.create(this._serviceProvider, prev => prev.parent())) {
            const descriptors = svc.getOwnDescriptors(serviceId);
            if (Iterables.has(descriptors)) {
                yield svc;
            }
        }
    }

    resolveEntry(descriptorOrId: ServiceIdentifier | IServiceDescriptor): ServiceEntry | undefined {
        if (ServiceIdentifier.is(descriptorOrId)) {
            const all = this.resolveEntries(<ServiceIdentifier>descriptorOrId);
            return Iterables.first(all);
        }
        else {
            const all = this.resolveEntries((<IServiceDescriptor>descriptorOrId).serviceId);
            return Iterables.first(all, entry => entry.desc === descriptorOrId);
        }
    }

    *resolveEntries(serviceId: ServiceIdentifier): Iterable<ServiceEntry> {
        for (const svc of Iterables.create(this._serviceProvider, prev => prev.parent())) {
            for (const desc of svc.getOwnDescriptors(serviceId)) {
                if (isAllowedScope(desc.scope, svc === this._serviceProvider)) {
                    const provider = desc.lifetime === ServiceLifetime.scoped ? this._serviceProvider : svc;
                    yield ServiceEntry.create(desc, provider);
                }
            }
        }
    }

    *resolveDependencies(ctor: Constructor): Iterable<IServiceDependency> {
        for (const param of ServiceIdentifier.registry.dependencies(ctor)) {
            if (param.type === "many") {
                const entries = this.resolveEntries(param.serviceId);
                yield new MultipleServiceDependency(param, entries);
            }
            else if (param.type === "options") {
                const entries = this.resolveEntries(param.serviceId);
                yield new OptionsServiceDependency(param, entries);
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

        const stack: ServiceEntry[] = [entry];
        do {
            const entry = stack.pop()!;

            // Get the dependency resolver from the scope of the service
            const dependencyResolver = entry.provider.get(IDependencyResolver, true);

            const dependencies = [...dependencyResolver.resolveDependencies(entry.desc.ctor)];

            const serviceEntries = dependencies.flatMap(dep => [...dep.entries()]);
            graph.add({ ...entry, dependencies }, ...serviceEntries);

            const serviceToResolve = serviceEntries
                .filter(e => !graph.has(e) && !e.desc.delayed && !ServiceEntry.getScopeInstance(e));
            stack.push(...serviceToResolve);
        }
        while (stack.length);

        return graph;
    }
}
