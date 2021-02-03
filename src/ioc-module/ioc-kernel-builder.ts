import { IServiceProvider, ServiceAccessor } from "../service-provider";
import { ServiceCollection } from "../service-collection";
import { ServiceProvider } from "../service-provider";

import { IoCModuleBuilderBase } from "./ioc-module-builder-base";
import { IoCKernel } from "./ioc-kernel";
import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";

export class IoCKernelBuilder extends IoCModuleBuilderBase {

    protected createModule(provider: IServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule {
        return new IoCKernel(provider, setups);
    }

    protected createServiceProvider(services: ServiceCollection): IServiceProvider {
        return new ServiceProvider(services);
    }

    protected configureDefaultServices(services: ServiceCollection, provider: IServiceProvider): void {
        services.addTransient(ServiceAccessor);
    }
}
