import { Disposable, IDisposable } from "@aster-js/core";

import { ServiceContract, ServiceIdentifier } from "../service-registry";

import { IServiceProvider } from "./iservice-provider";
import { IServiceAccessor } from "./iservice-accessor";
import { ServiceProxy } from "./service-proxy";

@ServiceContract(IServiceAccessor)
export class ServiceAccessor extends Disposable implements IServiceAccessor {
    private readonly _proxies: Map<ServiceIdentifier, ServiceProxy>;
    private readonly _manyProxies: Map<ServiceIdentifier, ServiceProxy[]>;

    constructor(
        @IServiceProvider private readonly _serviceProvider: IServiceProvider
    ) {
        super();
        this._proxies = new Map();
        this._manyProxies = new Map();
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): any {
        this.checkIfDisposed();

        let serviceProxy = this._proxies.get(serviceId);
        if (!serviceProxy) {
            const instance = this._serviceProvider.get(serviceId, required);

            if (!instance) return;

            serviceProxy = new ServiceProxy<T>(instance);
            this._proxies.set(serviceId, serviceProxy);
        }
        return serviceProxy.proxy;
    }

    *getAll(serviceId: ServiceIdentifier, currentScopeOnly?: boolean): Iterable<any> {
        this.checkIfDisposed();

        let serviceProxies = this._manyProxies.get(serviceId);
        if (!serviceProxies) {
            serviceProxies = [...this._serviceProvider.getAll(serviceId, currentScopeOnly)]
                .map(x => new ServiceProxy(x));
            this._manyProxies.set(serviceId, serviceProxies);
        }

        for (const p of serviceProxies) {
            yield p.proxy;
        }
    }

    protected dispose(): void {
        IDisposable.safeDisposeAll(this._proxies.values());
        this._proxies.clear();

        IDisposable.safeDisposeAll([...this._manyProxies.values()].flat());
        this._manyProxies.clear();
    }
}
