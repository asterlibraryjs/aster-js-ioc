import { DependencyParameter } from "../service-registry";
import { InstanciationContext } from "./instanciation-context";

import { IServiceDependency, ServiceEntry } from "./service-entry";

export class EmptyServiceDependency implements IServiceDependency {
    constructor(
        readonly param: DependencyParameter
    ) { }

    resolveArg(_ctx?: InstanciationContext): any { }

    *entries(): Iterable<ServiceEntry> { }
}

export class SingleServiceDependency implements IServiceDependency {
    constructor(
        readonly param: DependencyParameter,
        private readonly _entry: ServiceEntry
    ) { }

    resolveArg(ctx?: InstanciationContext): any {
        if (ctx) {
            return ctx.getInstance(this._entry);
        }
        return this._entry.provider.get(this._entry.desc);
    }

    getDependencyArg(_ctx: InstanciationContext): any { }

    *entries(): Iterable<ServiceEntry> {
        yield this._entry;
    }
}

export class MultipleServiceDependency implements IServiceDependency {
    private readonly _entries: ServiceEntry[];

    constructor(
        readonly param: DependencyParameter,
        entries: Iterable<ServiceEntry>
    ) {
        this._entries = [...entries];
    }

    resolveArg(ctx?: InstanciationContext): any {
        if (ctx) {
            return this._entries.map(e => ctx.getInstance(e));
        }
        return this._entries.map(e => e.provider.get(e.desc));
    }

    *entries(): Iterable<ServiceEntry> {
        yield* this._entries;
    }
}