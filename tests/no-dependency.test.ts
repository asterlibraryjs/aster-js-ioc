import { assert } from "chai";
import { assert as sassert, spy } from "sinon";
import { IServiceProvider, Optional, IoCKernel, IServiceFactory, Inject } from "../src";
import { HttpClient, ICustomerService, NoDependencyCustomerService } from "./service.mocks";

describe("Dependency Injection without Graph", () => {

    it("Should be auto registered in service collection", () => {
        const container = IoCKernel.create().build();

        const result = container.services.get(IServiceProvider);

        assert.equal(result, container.services);
    });

    it("Should throw when service not bound", () => {
        const { services } = IoCKernel.create().build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob));
    });

    it("Should inject properly bound service", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
    });

    it("Should inject properly bound service using service contract", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
    });

    it("Should inject properly bound service dependency without id", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(HttpClient))
            .build();

        class Bob {
            constructor(@Inject(HttpClient) readonly svc: HttpClient) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, HttpClient);
    });

    it("Should setup a service without id", async () => {
        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(HttpClient))
            .setup(HttpClient, svc => svc.init())
            .build();

        class Bob {
            constructor(@Inject(HttpClient) readonly svc: HttpClient) { }
        }

        await kernel.start();

        const result = kernel.services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, HttpClient);
        assert.isTrue(result.svc.initialized);
    });

    it("Should setup a service with id", async () => {
        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .setup(ICustomerService, svc => svc.init())
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc: NoDependencyCustomerService) { }
        }

        await kernel.start();

        const result = kernel.services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
        assert.isTrue(result.svc.initialized);
    });

    it("Should throw an error when not enough arguments", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(index: number, @ICustomerService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob), /(expected 1 arguments)/);
    });

    it("Should throw an error when too much arguments", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(index: number, @ICustomerService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob, 0, 2), /(expected 1 arguments)/);
    });

    it("Should ignore optional service", () => {
        const { services } = IoCKernel.create().build();

        class Bob {
            constructor(@Optional(ICustomerService) readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isUndefined(result.svc);
    });

    it("Should bound optional service", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(@Optional(ICustomerService) readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
    });

    it("Should bind properly a factory", async () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(
                IServiceFactory.create(ICustomerService, acc => {
                    const provider = acc.get(IServiceProvider, true);
                    return provider.createInstance(NoDependencyCustomerService);
                }, NoDependencyCustomerService)
            ))
            .build();

        const createInstanceSpy = spy(services, "createInstance");

        const result = services.get(ICustomerService);

        sassert.notCalled(createInstanceSpy); // Factory should not be called immediatly

        assert.instanceOf(result, NoDependencyCustomerService);
        assert.equal(await result!.getAddress("bo"), "Hello bo !");
        sassert.calledOnce(createInstanceSpy);
    });

    it("Should create a child module", () => {
        const container = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .build();

        const childScope = container.createChildScope("child").build();

        class Bob {
            constructor(@ICustomerService readonly svc: any) { }
        }

        const result = childScope.services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
    });
});
