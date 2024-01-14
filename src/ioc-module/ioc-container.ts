import { DisposableHost, IDisposable } from "@aster-js/core";
import { AbortableToken, AbortToken, Deferred, Delayed, assertAllSettledResult } from "@aster-js/async";

import type { ServiceProvider } from "../service-provider";

import { IIoCModule, IIoCModuleSetupAction, IoCModuleSetupExecBehavior, IoCModuleSetupResultBehavior } from "./iioc-module";
import type { IIoCContainerBuilder } from "./iioc-module-builder";
import type { IoCModuleBuilder } from "./ioc-module-builder";

export abstract class IoCContainer extends DisposableHost implements IIoCModule {
    private readonly _setups: IIoCModuleSetupAction[];
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
        setups: Iterable<IIoCModuleSetupAction>
    ) {
        super();
        this._children = new Map();
        this._ready = new Deferred();
        this._setups = [...setups];
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

        const setupCallbacks = this._setups.splice(0);
        try {
            const asyncTasks = [];

            for (const setup of setupCallbacks) {
                token.throwIfAborted();

                const task = setup.exec(this._provider, token);
                if(setup.execBehavior === IoCModuleSetupExecBehavior.asynchronous) {
                    asyncTasks.push(task);
                }

                const result = await task;
                if (result === IoCModuleSetupResultBehavior.stop) break;
            }

            if(asyncTasks.length !== 0){
                const results = await Promise.allSettled(asyncTasks);
                assertAllSettledResult(results);
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
