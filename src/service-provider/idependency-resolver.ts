import { ServiceIdentifier } from "../service-registry";

import { IServiceDependency, ServiceEntry } from "./service-entry";
import { TopologicalGraph } from "@aster-js/iterators";
import { Constructor } from "@aster-js/core";
import { ServiceProvider } from "./service-provider";
import { IServiceDescriptor } from "../service-descriptors";

export const IDependencyResolver = ServiceIdentifier<IDependencyResolver>("IDependencyResolver");

/**
 * Provides methods to retrieve service descriptors and ressolving dependencies
 */
export interface IDependencyResolver {
    resolveProviders(serviceId: ServiceIdentifier): Iterable<ServiceProvider>;

    resolveEntry(descriptorOrId: ServiceIdentifier | IServiceDescriptor): ServiceEntry | undefined;

    resolveEntries(serviceId: ServiceIdentifier): Iterable<ServiceEntry>;

    resolveDependencies(ctor: Constructor): Iterable<IServiceDependency>;

    resolveDependencyGraph(entry: ServiceEntry): TopologicalGraph<ServiceEntry>;
}
