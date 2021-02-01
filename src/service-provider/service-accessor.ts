import { Disposable, IDisposable } from "@aster-js/core";

import { ServiceContract, ServiceIdentifier } from "../service-registry";

import { IServiceProvider } from "./iservice-provider";
import { IServiceAccessor } from "./iservice-accessor";
import { ServiceProxy } from "./service-proxy";

@ServiceContract(IServiceAccessor)
export class ServiceAccessor extends Disposable implements IServiceAccessor {
    private readonly _proxies: Map<ServiceIdentifier, ServiceProxy>;

    constructor(
        @IServiceProvider private readonly _serviceProvider: IServiceProvider
    ) {
        super();
        this._proxies = new Map();
    }

    has(serviceId: ServiceIdentifier): boolean {
        this.checkIfDisposed();

        return this._serviceProvider.has(serviceId);
    }

    get<T>(serviceId: ServiceIdentifier<T>, required: true): T;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): T | undefined;
    get<T>(serviceId: ServiceIdentifier<T>, required?: boolean): any {
        this.checkIfDisposed();

        let serviceProxy = this._proxies.get(serviceId);
        if (!serviceProxy) {
            const instance = this._serviceProvider.get(serviceId, required);
            if (instance) {
                serviceProxy = new ServiceProxy<T>(instance);
                this._proxies.set(serviceId, serviceProxy);
            }
        }
        return serviceProxy?.proxy;
    }

    protected dispose(): void {
        for (const proxy of this._proxies.values()){
            IDisposable.safeDispose(proxy);
        }
    }
}