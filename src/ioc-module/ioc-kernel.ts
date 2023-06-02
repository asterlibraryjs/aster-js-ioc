import type { Delayed } from "@aster-js/async";

import { ServiceAccessor } from "../service-provider/service-accessor";
import { ServiceProvider } from "../service-provider/service-provider";

import type { ServiceCollection } from "../service-collection";

import { IoCContainer } from "./ioc-container";
import { IoCContainerBuilder } from "./ioc-container-builder";
import { IoCModuleBuilder } from "./ioc-module-builder";
import { IoCModule } from "./ioc-module";

import type { IIoCModule, IIoCModuleSetupAction } from "./iioc-module";

export class IoCKernel extends IoCContainer {

    protected createIoCModuleBuilder(name: string, target: Delayed<IIoCModule>): IoCModuleBuilder {
        return new IoCModuleBuilder(name, target, this, IoCModule.factory);
    }

    static create(): IoCKernelBuilder {
        return new IoCKernelBuilder("kernel");
    }
}

export class IoCKernelBuilder extends IoCContainerBuilder {

    protected createModule(name: string, provider: ServiceProvider, setups: IIoCModuleSetupAction[]): IIoCModule {
        return new IoCKernel(name, provider, setups);
    }

    protected createServiceProvider(services: ServiceCollection): ServiceProvider {
        return new ServiceProvider(services);
    }

    protected configureDefaultServices(services: ServiceCollection, _provider: ServiceProvider): void {
        services.addTransient(ServiceAccessor);
    }
}
