import { DisposableHost } from "@aster-js/core";

const ProxyInstance = Symbol();

export function isServiceProxy(proxy: any) {
    return typeof proxy[ProxyInstance] !== "undefined";
}

export function isServiceProxyFor(proxy: any, expectedSource: any) {
    return proxy[ProxyInstance] === expectedSource;
}

export class ServiceProxy<T = any> extends DisposableHost implements ProxyHandler<any> {
    private readonly _proxy: T;
    private readonly _service: T;
    private readonly _revoke: Function;

    get proxy(): T { return this._proxy; }

    constructor(service: T) {
        super();
        const { proxy, revoke } = Proxy.revocable(service, this);
        this._proxy = proxy;
        this._service = service;
        this._revoke = revoke;
    }

    has(target: any, p: PropertyKey): boolean {
        return p in target;
    }

    get(target: any, p: PropertyKey): any {
        if (p === ProxyInstance) return this._service;

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
