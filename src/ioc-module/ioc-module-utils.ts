import { Iterables, Iterators } from "@aster-js/iterators";
import { ServiceIdentifier } from "../service-registry";
import { IIoCModule } from "./iioc-module";

export function findRootService<T>(serviceId: ServiceIdentifier<T>, module: IIoCModule): T | undefined {
    const all = AllParentServices<T>(serviceId, module, false);
    return Iterables.last(all);
}

export function firstParentService<T>(serviceId: ServiceIdentifier<T>, module: IIoCModule): T | undefined {
    const all = AllParentServices<T>(serviceId, module, false);
    return Iterables.first(all);
}


export function* AllParentServices<T>(serviceId: ServiceIdentifier<T>, module: IIoCModule, includeSelf: boolean) {
    const root = includeSelf ? module : module.parent;
    if (root) {
        for (const parent of getAllParents(root)) {
            const service = parent.services.get(serviceId);
            if (service) yield service;
        }
    }
}

/** Returns all parent services for provided module */
export function* getAllParents(module: IIoCModule) {
    let current: IIoCModule | undefined = module;
    while (current) {
        yield current;
        current = current.parent;
    }
}
