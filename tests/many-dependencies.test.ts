import { assert } from "chai";
import { IoCKernel } from "../src";
import { BasicCustomerService, ICustomerService, NoDependencyCustomerService, HttpService, AdvancedCustomerService } from "./service.mocks";

describe("Dependency Injection with multiple instance of the same service", () => {

    it("Should inject many instances of a service type including itself!", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(NoDependencyCustomerService)
                    .addSingleton(BasicCustomerService)
                    .addSingleton(HttpService)
                    .addSingleton(AdvancedCustomerService, { delayed: true }) // Self referencing
            })
            .setup(ICustomerService, x => x.init())
            .build();

        const result = [...services.getAll(ICustomerService)];

        assert.equal(result.length, 3);
        assert.instanceOf(result[0], NoDependencyCustomerService);
        assert.instanceOf(result[1], BasicCustomerService);
        assert.instanceOf(result[2], AdvancedCustomerService);
        assert.equal(await result[2].getAddress("Bob"), "Hello Bob !<br/>Data from /api/customers/Bob");
    });

    it("Should setup many instances of a service type", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(NoDependencyCustomerService)
                    .addSingleton(BasicCustomerService)
                    .addSingleton(HttpService)
                    .addSingleton(AdvancedCustomerService, { delayed: true }) // Self referencing
            })
            .setupMany(ICustomerService, c => c.init())
            .build();

        await kernel.start();

        const result = [...kernel.services.getAll(ICustomerService)];

        assert.equal(result.length, 3);
        assert.instanceOf(result[0], NoDependencyCustomerService);
        assert.instanceOf(result[1], BasicCustomerService);
        assert.instanceOf(result[2], AdvancedCustomerService);
        assert.isTrue(result[0].initialized);
        assert.isTrue(result[1].initialized);
        assert.isTrue(result[2].initialized);
    });

    it("Should try but fail to add multiple service with the same id", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .tryAddSingleton(NoDependencyCustomerService)
                    .tryAddSingleton(BasicCustomerService)
                    .tryAddSingleton(HttpService)
                    .tryAddSingleton(AdvancedCustomerService, { delayed: true }) // Self referencing
            })
            .build();

        const result = [...kernel.services.getAll(ICustomerService)];

        assert.equal(result.length, 1);
        assert.instanceOf(result[0], NoDependencyCustomerService);
    });
});
