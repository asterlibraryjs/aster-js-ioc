import { ServiceAccessor } from "../service-provider";
import { ServiceCollection } from "../service-collection";
import { ServiceProvider } from "../service-provider";

import { IoCContainerBuilder } from "./ioc-container-builder";
import { IoCKernel } from "./ioc-kernel";
import { IIoCModule } from "./iioc-module";
import { IoCModuleSetupDelegate } from "./iioc-module-builder";

export class IoCKernelBuilder extends IoCContainerBuilder {

    protected createModule(provider: ServiceProvider, setups: IoCModuleSetupDelegate[]): IIoCModule {
        return new IoCKernel(provider, setups);
    }

    protected createServiceProvider(services: ServiceCollection): ServiceProvider {
        return new ServiceProvider(services);
    }

    protected configureDefaultServices(services: ServiceCollection, provider: ServiceProvider): void {
        services.addTransient(ServiceAccessor);
    }
}
