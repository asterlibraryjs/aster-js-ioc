import { assert } from "chai";
import { IoCKernel, ServiceScope } from "../src";
import { BasicCustomerService, ICustomerService, NoDependencyCustomerService, HttpService, AdvancedCustomerService } from "./service.mocks";

describe("Scopes", () => {

    it("Should reuse the same instance in each child scope", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(BasicCustomerService)
                    .addSingleton(HttpService);
            })
            .build();

        const child1 = kernel.createChildScope("child1").build();
        const child2 = kernel.createChildScope("child2").build();

        const kernelResult = kernel.services.get(ICustomerService, true);
        const result1 = child1.services.get(ICustomerService, true);
        const result2 = child2.services.get(ICustomerService, true);

        assert.instanceOf(kernelResult, BasicCustomerService);
        assert.instanceOf(result1, BasicCustomerService);
        assert.instanceOf(result2, BasicCustomerService);
        assert.equal(kernelResult, result1);
        assert.equal(result1, result2);
    });

    it("Should create a new instance of a service in each scope", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .addScoped(BasicCustomerService)
                    .addSingleton(HttpService);
            })
            .build();

        const child1 = kernel.createChildScope("child1").build();
        const child2 = kernel.createChildScope("child2").build();

        const result1 = child1.services.get(ICustomerService, true);
        const result2 = child2.services.get(ICustomerService, true);

        assert.instanceOf(result1, BasicCustomerService);
        assert.instanceOf(result2, BasicCustomerService);
        assert.notEqual(result1, result2);
    });

    it("Should not be able to get instance in a child when scope is limited to container", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .addScoped(BasicCustomerService, { scope: ServiceScope.container })
                    .addSingleton(HttpService);
            })
            .build();

        const child = kernel.createChildScope("child1").build();

        const kernelSvc = kernel.services.get(ICustomerService, false);
        const childSvc = child.services.get(ICustomerService, false);

        assert.isUndefined(childSvc);
        assert.instanceOf(kernelSvc, BasicCustomerService);
    });

    it("Should not be able to get instance in container when scope is limited to children", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services
                    .addScoped(BasicCustomerService, { scope: ServiceScope.children })
                    .addSingleton(HttpService);
            })
            .build();

        const child = kernel.createChildScope("child1").build();

        const kernelSvc = kernel.services.get(ICustomerService, false);
        const childSvc = child.services.get(ICustomerService, false);

        assert.isUndefined(kernelSvc);
        assert.instanceOf(childSvc, BasicCustomerService);
    });
});
