import { assert } from "chai";
import { IoCKernel, ServiceContract, ServiceIdentifier, Options, resolveServiceId } from "../src";

describe("Dependency Injection without Graph", () => {

    const IServiceOptions = ServiceIdentifier<IServiceOptions>("IServiceOptions");
    interface IServiceOptions {
        readonly name: string;
        readonly count: number;
        readonly enabled: boolean;
    }

    @ServiceContract(IServiceOptions)
    class DefaultOptions implements IServiceOptions {
        readonly name: string = "bob";
        readonly count: number = 0;
        readonly enabled: boolean = false;
    }

    class CustomerService {
        constructor(
            @Options(IServiceOptions) readonly options: IServiceOptions
        ) { }
    }

    it("Should be auto registered in service collection", () => {
        const container = IoCKernel.create()
            .configure(services => {
                services.addSingleton(CustomerService);
                services.addSingleton(DefaultOptions);


                services.addInstance(IServiceOptions, { count: 22, enabled: true }, {});
            })
            .build();

        const serviceId = resolveServiceId(CustomerService);
        const result = container.services.get(serviceId, true);

        assert.isTrue(result.options.enabled, "result.options.enabled");
        assert.equal(result.options.count,  22, "result.options.count");
        assert.equal(result.options.name, "bob", "result.options.name");
    });

});
