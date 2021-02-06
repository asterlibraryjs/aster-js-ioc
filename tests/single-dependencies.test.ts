import { assert } from "chai";
import { IServiceProvider, IoCKernel } from "../src";
import { BasicCustomerService, HttpService, ICustomerService } from "./service.mocks";

describe("Dependency Injection with 1 level of graph resolution", () => {

    it("Should resolve a service instance with a dependency", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(BasicCustomerService)
                    .addSingleton(HttpService);
            })
            .build();

        const result = services.get(ICustomerService, true);

        assert.instanceOf(result, BasicCustomerService);
        assert.equal(await result.getAddress("Bob"), "Data from /api/customers/Bob");
    });
});
