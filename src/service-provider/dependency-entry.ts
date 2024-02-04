import { DependencyParameter } from "../service-registry";
import { InstantiationContext } from "./instantiation-context";

import { IServiceDependency, ServiceEntry } from "./service-entry";

export class EmptyServiceDependency implements IServiceDependency {
    constructor(
        readonly param: DependencyParameter
    ) { }

    resolveArg(_ctx?: InstantiationContext): any { }

    *entries(): Iterable<ServiceEntry> { }
}

export class SingleServiceDependency implements IServiceDependency {
    constructor(
        readonly param: DependencyParameter,
        private readonly _entry: ServiceEntry
    ) { }

    resolveArg(ctx?: InstantiationContext): any {
        if (ctx) {
            return ctx.getInstance(this._entry);
        }
        return this._entry.provider.get(this._entry.desc);
    }

    getDependencyArg(_ctx: InstantiationContext): any { }

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

    resolveArg(ctx?: InstantiationContext): any {
        if (ctx) {
            return this._entries.map(e => ctx.getInstance(e));
        }
        return this._entries.map(e => e.provider.get(e.desc));
    }

    *entries(): Iterable<ServiceEntry> {
        yield* this._entries;
    }
}


export class OptionsServiceDependency implements IServiceDependency {
    private readonly _entries: ServiceEntry[];

    constructor(
        readonly param: DependencyParameter,
        entries: Iterable<ServiceEntry>
    ) {
        this._entries = [...entries];
    }

    resolveArg(ctx?: InstantiationContext): any {
        const result = {};
        for (const opts of this.resolveOptions(ctx)) {
            Object.assign(result, opts);
        }
        return result;
    }

    private *resolveOptions(ctx: InstantiationContext | undefined): Iterable<any> {
        if (ctx) {
            for (const e of this._entries) yield ctx.getInstance(e);
        }
        else {
            for (const e of this._entries) yield e.provider.get(e.desc);
        }
    }

    *entries(): Iterable<ServiceEntry> {
        yield* this._entries;
    }
}
