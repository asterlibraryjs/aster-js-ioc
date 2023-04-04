import { Disposable, IDisposable } from "@aster-js/core";
import { AbortableToken, AbortToken, Deferred, Delayed } from "@aster-js/async";

import { IServiceAccessor, ServiceProvider } from "../service-provider";

import type { IIoCModule } from "./iioc-module";
import type { IIoCContainerBuilder, IoCModuleSetupDelegate } from "./iioc-module-builder";
import type { IoCModuleBuilder } from "./ioc-module-builder";

export abstract class IoCContainer extends Disposable implements IIoCModule {
    private readonly _setupCallbacks: IoCModuleSetupDelegate[];
    private readonly _children: Map<string, Delayed<IIoCModule>>;
    private readonly _ready: Deferred;
    private _token?: AbortableToken;

    get abortToken(): AbortToken { return this._token?.readOnly ?? AbortToken.none; }

    get running(): boolean { return !this._token?.aborted; }

    get services(): ServiceProvider { return this._provider; }

    get ready(): PromiseLike<void> { return this._ready; }

    constructor(
        readonly name: string,
        private readonly _provider: ServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>
    ) {
        super();
        this._children = new Map();
        this._ready = new Deferred();
        this._setupCallbacks = [...setupCallbacks];
    }

    createChildScope(name: string): IIoCContainerBuilder {
        if (this._children.has(name)) throw new Error(`Duplicate child scope "${name}"`);


        const delayed = new Delayed<IIoCModule>();
        this._children.set(name, delayed);
        return this.createIoCModuleBuilder(name, delayed);
    }

    protected abstract createIoCModuleBuilder(name: string, target: Delayed<IIoCModule>): IoCModuleBuilder;

    async start(): Promise<boolean> {
        if (this._token) return false;

        const token = AbortToken.create();
        this._token = token;

        const acc = this._provider.get(IServiceAccessor, true);

        const setupCallbacks = this._setupCallbacks.splice(0);
        try {
            for (const setup of setupCallbacks) {
                token.throwIfAborted();
                await setup(acc, token);
            }
            this._ready.resolve();
            return true;
        }
        catch (err) {
            token.abort(err);
            this._ready.reject(err);
            return false;
        }
    }

    *[Symbol.iterator](): IterableIterator<IIoCModule> {
        for (const child of this._children.values()) {
            if (child.has()) yield child.get() as IIoCModule;
        }
    }

    protected dispose(): void {
        IDisposable.safeDisposeAll(this._children.values());
        IDisposable.safeDispose(this._provider);
        IDisposable.safeDispose(this._token);
    }
}
