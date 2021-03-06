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
            .build();

        const result = [...services.getAll(ICustomerService)];

        assert.equal(result.length, 3);
        assert.instanceOf(result[0], NoDependencyCustomerService);
        assert.instanceOf(result[1], BasicCustomerService);
        assert.instanceOf(result[2], AdvancedCustomerService);
        assert.equal(await result[2].getAddress("Bob"), "Hello Bob !<br/>Data from /api/customers/Bob");
    });
});
