import { assert } from "chai";
import { IServiceProvider, IoCKernel } from "../src";
import { BasicCustomerService, HttpService, ICustomerService, IHttpService, IUIService, UIService } from "./service.mocks";

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

    it("Should no instanciate services binded through delayed service", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(UIService, { delayed: true, baseArgs:[0] })
                    .addSingleton(BasicCustomerService, { delayed: true })
                    .addSingleton(HttpService);
            })
            .build();

        const result = services.get(IUIService, true);

        assert.instanceOf(result, UIService);
        assert.instanceOf((result as UIService).customerService, BasicCustomerService);

        const [desc] = services.getScopeDescriptors(IHttpService)
        assert.isUndefined(services.getScopeInstance(desc));

        await result.render([]);

        assert.instanceOf(services.getScopeInstance(desc), HttpService);
    });
});
