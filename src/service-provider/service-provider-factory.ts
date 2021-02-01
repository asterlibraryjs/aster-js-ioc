import { IServiceFactory, ServiceFactory } from "../service-registry";

import { ServiceProvider } from "./service-provider";
import { IServiceProvider } from "./iservice-provider";

@ServiceFactory(IServiceProvider)
export class ServiceProviderFactory implements IServiceFactory<ServiceProvider> {

    static readonly targetType = ServiceProvider;

    constructor(
        private readonly _provider: ServiceProvider
    ) { }

    create(): ServiceProvider {
        return this._provider;
    }
}