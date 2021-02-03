import { Disposable, IDisposable } from "@aster-js/core";
import { AbortableToken, AbortToken, Deferred, Delayed } from "@aster-js/async";

import { IServiceAccessor, IServiceProvider } from "../service-provider";

import { IIoCModule } from "./iioc-module";
import { IIoCContainerBuilder, IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCModuleBuilder } from "./ioc-module-builder";

export class IoCContainer extends Disposable implements IIoCModule {
    private readonly _setupCallbacks: IoCModuleSetupDelegate[];
    private readonly _children: Map<string, Delayed<IIoCModule>>;
    private readonly _ready: Deferred;
    private _token?: AbortableToken;

    get abortToken(): AbortToken { return this._token?.readOnly ?? AbortToken.none; }

    get running(): boolean { return !this._token?.aborted; }

    get services(): IServiceProvider { return this._provider; }

    get ready(): PromiseLike<void> { return this._ready; }

    constructor(
        private readonly _provider: IServiceProvider,
        setupCallbacks: Iterable<IoCModuleSetupDelegate>
    ) {
        super();
        this._children = new Map();
        this._ready = new Deferred();
        this._setupCallbacks = [...setupCallbacks];
    }

    createScope(name: string): IIoCContainerBuilder {
        const delayed = new Delayed<IIoCModule>();
        this._children.set(name, delayed);
        return new IoCModuleBuilder(delayed, this);
    }

    async start(): Promise<void> {
        if (this._token) throw new Error(`Current module has already been started, cannot start the same module twice`);

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
        }
        catch (err) {
            this._ready.reject(err);
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
