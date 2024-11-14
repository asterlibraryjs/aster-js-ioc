import { DisposableHost, IDisposable } from "@aster-js/core";
import { AbortableToken, AbortToken, Deferred, Delayed } from "@aster-js/async";

import type { ServiceProvider } from "../service-provider";

import { IIoCModule, IIoCModuleSetupAction, IoCModuleSetupExecBehavior, IoCModuleSetupResultBehavior } from "./iioc-module";
import type { IIoCContainerBuilder } from "./iioc-module-builder";
import type { IoCModuleBuilder } from "./ioc-module-builder";
import { Memoize, cacheResult } from "@aster-js/decorators";
import { ILogger } from "../core-services";

function* resolvePathSegments(target: IIoCModule): Iterable<string> {
    let current: IIoCModule | undefined = target;
    while (current) {
        yield current.name;
        current = current.parent;
    }
}

export abstract class IoCContainer extends DisposableHost implements IIoCModule {
    private readonly _setups: IIoCModuleSetupAction[];
    private readonly _children: Map<string, Delayed<IIoCModule>>;
    private readonly _ready: Deferred<this>;
    private _token?: AbortableToken;

    @Memoize
    get path(): string { return [...resolvePathSegments(this)].reverse().join("/"); }

    get abortToken(): AbortToken { return this._token?.readOnly ?? AbortToken.none; }

    get running(): boolean { return this._token ? !this._token.aborted : false; }

    get services(): ServiceProvider { return this._provider; }

    get ready(): PromiseLike<this> { return this._ready; }

    get logger(): ILogger | undefined { return this._provider.get(ILogger); }

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

        const setups = this._setups.splice(0);
        let idx = 0;
        try {
            const asyncTasks = [];

            this.logger?.debug("Starting IoC module with {setupCount} setup(s) and {serviceCount} service(s)", setups.length, this.services.size);

            for (; idx < setups.length; idx++) {
                const setup = setups[idx];
                token.throwIfAborted();

                const task = setup.exec(this._provider, token);

                if (setup.execBehavior === IoCModuleSetupExecBehavior.asynchronous) {
                    asyncTasks.push(task);
                }
                else {
                    const taskResult = await task;
                    if (taskResult === IoCModuleSetupResultBehavior.stop) break;
                }
            }

            if (asyncTasks.length !== 0) {
                await this.execAsyncTasks(asyncTasks);
            }

            this.logger?.info("Application successfully started.");

            this._ready.resolve(this);
            return true;
        }
        catch (err) {
            this.handleSetupError(err, idx, setups, token);
            return false;
        }
    }

    private handleSetupError(err: unknown, taskIdx: number, setups: IIoCModuleSetupAction[], token: AbortableToken): void {
        try {
            this.logger?.critical(err, "Error while executing IoC setup action #{number} of the {count} setups", taskIdx, setups.length);
            this._ready.reject(err);
        }
        finally {
            token.abort(err);
        }
    }

    private async execAsyncTasks(asyncTasks: PromiseLike<IoCModuleSetupResultBehavior>[]): Promise<void> {
        const results = await Promise.allSettled(asyncTasks);

        const rejected = results.filter(r => r.status === "rejected");

        if (rejected.length !== 0) {

            const logger = this.logger;
            if (logger) {
                for (let i = 0; i < rejected.length; i++) {
                    const fault = rejected[i];
                    logger.critical((<PromiseRejectedResult>fault).reason, "Error while executing IoC setup action ({number}/{count})", i + 1, rejected.length);
                }
            }

            throw new AggregateError(rejected.map(r => (<PromiseRejectedResult>r).reason), "Error while executing IoC setup action");
        }
    }

    async *[Symbol.asyncIterator](): AsyncIterableIterator<IIoCModule> {
        for (const child of this._children.values()) {
            yield await child.get();
        }
    }

    protected dispose(): void {
        IDisposable.safeDisposeAll(this._children.values());
        IDisposable.safeDispose(this._provider);
        IDisposable.safeDispose(this._token);
    }
}
