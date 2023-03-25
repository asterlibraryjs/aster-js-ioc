import { assert } from "chai";
import { isLazyProxy } from "@aster-js/core"
import { IoCKernel } from "../src";
import { BasicCustomerService, HttpClient, HttpService, ICustomerService, IHttpService, InjectDependencyCustomerService, IUIService, UIService } from "./service.mocks";

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

    it("Should resolve an existing instance", async () => {
        const httpService = new HttpService();
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addInstance(IHttpService, httpService);
            })
            .build();

        const result = services.get(IHttpService, true);

        assert.instanceOf(result, HttpService);
        assert.isTrue(isLazyProxy(result));
        assert.equal(httpService.id, (<HttpService>result).id);
    });

    it("Should resolve a service instance with a dependency without Id", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(InjectDependencyCustomerService)
                    .addSingleton(HttpClient);
            })
            .build();

        const result = services.get(ICustomerService, true);

        assert.instanceOf(result, InjectDependencyCustomerService);
        assert.equal(await result.getAddress("Nob"), "HttpClient data from /api/customers/Nob");
    });

    it("Should not resolve an optional service instance with a dependency without Id", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(InjectDependencyCustomerService);
            })
            .build();

        const result = services.get(ICustomerService, true);

        assert.instanceOf(result, InjectDependencyCustomerService);
        assert.equal(await result.getAddress("Nob"), "not found");
    });

    it("Should no instanciate services binded through delayed service", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(UIService, { delayed: true, baseArgs: [0] })
                    .addSingleton(BasicCustomerService, { delayed: true })
                    .addSingleton(HttpService);
            })
            .build();

        const result = services.get(IUIService, true);

        assert.instanceOf(result, UIService);
        assert.instanceOf((result as UIService).customerService, BasicCustomerService);

        const [desc] = services.getOwnDescriptors(IHttpService)
        assert.isUndefined(services.getOwnInstance(desc));

        await result.render([]);

        assert.instanceOf(services.getOwnInstance(desc), HttpService);
    });
});
