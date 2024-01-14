import { DisposableHost, IDisposable } from "@aster-js/core";

import { ServiceContract, ServiceIdentifier } from "../service-registry";

import { IServiceProvider } from "./iservice-provider";
import { IServiceAccessor } from "./iservice-accessor";
import { ServiceProxy } from "./service-proxy";
import { HashMap } from "@aster-js/collections";

@ServiceContract(IServiceAccessor)
export class ServiceAccessor extends DisposableHost implements IServiceAccessor {
    private readonly _proxies: HashMap<any, ServiceProxy>;

    constructor(
        @IServiceProvider private readonly _serviceProvider: IServiceProvider
    ) {
        super();
        this._proxies = new HashMap();
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    get(serviceId: ServiceIdentifier, required?: boolean): any {
        this.checkIfDisposed();

        const instance = this._serviceProvider.get(serviceId, required);
        if (instance) return this.getProxy(instance);
    }

    *getMany<T>(serviceId: ServiceIdentifier<T>, currentScopeOnly?: boolean): Iterable<T> {
        this.checkIfDisposed();

        for (const instance of this._serviceProvider.getAll(serviceId, currentScopeOnly)) {
            yield this.getProxy(instance);
        }
    }

    private getProxy(instance: any): any {
        const serviceProxy = this._proxies.getOrSet(instance, () => new ServiceProxy(instance));
        return serviceProxy?.proxy;
    }


    protected dispose(): void {
        const proxies = this._proxies.values();
        IDisposable.safeDisposeAll(proxies);
    }
}
