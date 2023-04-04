import type { Delayed } from "@aster-js/async";

import { ServiceAccessor } from "../service-provider";
import type { ServiceCollection } from "../service-collection";
import { ServiceProvider } from "../service-provider";

import { IoCContainer } from "./ioc-container";
import { IoCContainerBuilder } from "./ioc-container-builder";
import type { IIoCModule } from "./iioc-module";
import type { IoCModuleSetupDelegate } from "./iioc-module-builder";
import { IoCModuleBuilder } from "./ioc-module-builder";
import { IoCModule } from "./ioc-module";

export class IoCKernel extends IoCContainer {

    protected createIoCModuleBuilder(name: string, target: Delayed<IIoCModule>): IoCModuleBuilder {
        return new IoCModuleBuilder(name, target, this, IoCModule.factory);
    }

    static create(): IoCKernelBuilder {
        return new IoCKernelBuilder("kernel");
    }
}

export class IoCKernelBuilder extends IoCContainerBuilder {

    protected createModule(name: string, provider: ServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule {
        return new IoCKernel(name, provider, setups);
    }

    protected createServiceProvider(services: ServiceCollection): ServiceProvider {
        return new ServiceProvider(services);
    }

    protected configureDefaultServices(services: ServiceCollection, _provider: ServiceProvider): void {
        services.addTransient(ServiceAccessor);
    }
}
