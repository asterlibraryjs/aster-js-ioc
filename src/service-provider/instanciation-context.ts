import { HashMap } from "@aster-js/collections";
import { TopologicalGraph } from "@aster-js/iterators";
import { ServiceEntry } from "./service-entry";

export class InstanciationContext {
    private readonly _instances: HashMap<ServiceEntry, any>;

    constructor(
        private readonly _graph: TopologicalGraph<ServiceEntry>
    ) {
        this._instances = new HashMap(e => e.uid);
    }

    setInstance(entry: ServiceEntry, instance: any): void {
        this._instances.set(entry, instance);
    }

    getInstance(entry: ServiceEntry): any {
        return this._instances.get(entry);
    }

    *entries(): Iterable<ServiceEntry> {
        yield* this._graph;
    }
}