import { Disposable } from "@aster-js/core";

export class ServiceProxy<T = any> extends Disposable implements ProxyHandler<any> {
    private readonly _proxy: T;
    private readonly _revoke: Function;

    get proxy(): T { return this._proxy; }

    constructor(value: T) {
        super();
        const { proxy, revoke } = Proxy.revocable(value, this);
        this._proxy = proxy;
        this._revoke = revoke;
    }

    has(target: any, p: PropertyKey): boolean {
        return p in target;
    }

    get(target: any, p: PropertyKey): any {
        const value = target[p];
        if (typeof value === "function") {
            return (...args: any[]) => {
                const r = value.apply(target, args);
                return r === target ? this._proxy : r;
            };
        }
        return value;
    }

    set(target: any, p: PropertyKey, value: any): boolean {
        target[p] = value;
        return true;
    }

    deleteProperty(target: any, p: PropertyKey): boolean {
        delete target[p];
        return true;
    }

    getPrototypeOf(target: T): any {
        return Object.getPrototypeOf(target);
    }

    protected dispose(): void {
        this._revoke();
    }
}
