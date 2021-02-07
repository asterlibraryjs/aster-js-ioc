import { HashMap } from "@aster-js/collections";
import { ServiceEntry } from "./service-entry";

export class InstanciationContext {
    private readonly _instances: HashMap<ServiceEntry, any>;

    constructor(
        readonly target: ServiceEntry
    ) {
        this._instances = new HashMap(e => e.uid);
    }

    setInstance(entry: ServiceEntry, instance: any): void {
        this._instances.set(entry, instance);
    }

    getInstance(entry: ServiceEntry): any {
        return this._instances.get(entry);
    }
}