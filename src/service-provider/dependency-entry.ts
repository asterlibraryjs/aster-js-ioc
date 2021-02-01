import { DependencyParameter } from "../service-registry";
import { InstanciationContext } from "./instanciation-context";

import { IServiceDependency, ServiceEntry } from "./service-entry";
import "./service-provider-factory";

export class EmptyServiceDependency implements IServiceDependency {
    constructor(
        readonly param: DependencyParameter
    ) { }

    getDependencyArg(_ctx: InstanciationContext): any { }

    *getDependencyEntries(): Iterable<ServiceEntry> { }
}

export class SingleServiceDependency implements IServiceDependency  {
    constructor(
        readonly param: DependencyParameter,
        private readonly _entry: ServiceEntry
    ) { }

    getDependencyArg(ctx: InstanciationContext): any {
        return ctx.getInstance(this._entry);
    }

    *getDependencyEntries(): Iterable<ServiceEntry> {
        yield this._entry;
    }
}

export class MultipleServiceDependency implements IServiceDependency  {
    private readonly _entries: ServiceEntry[];

    constructor(
        readonly param: DependencyParameter,
        entries: Iterable<ServiceEntry>
    ) {
        this._entries = [...entries];
    }

    getDependencyArg(ctx: InstanciationContext): any {
        return this._entries.map(e => ctx.getInstance(e));
    }

    *getDependencyEntries(): Iterable<ServiceEntry> {
        yield* this._entries;
    }
}