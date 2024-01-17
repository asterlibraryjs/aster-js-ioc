import { assert } from "chai";
import { assert as sassert, spy } from "sinon";
import { IServiceProvider, Optional, IoCKernel, IServiceFactory, Inject, Many, SetupErrorHandlerResult, ServiceScope } from "../src";
import { HttpClient, ICustomerService, NoContractCustomerService, NoDependencyCustomerService } from "./service.mocks";

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

    it("Should inject properly service", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(ICustomerService, NoContractCustomerService))
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoContractCustomerService);
    });

    it("Should try inject properly bound service and succeed", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.tryAddSingleton(NoDependencyCustomerService))
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoDependencyCustomerService);
    });

    it("Should try inject properly service and succeed", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.tryAddSingleton(ICustomerService, NoContractCustomerService))
            .build();

        class Bob {
            constructor(@ICustomerService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, NoContractCustomerService);
    });

    it("Should try inject properly service and fail", () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(NoDependencyCustomerService)
                    .tryAddSingleton(ICustomerService, NoContractCustomerService)
            })
            .build();

        class Bob {
            constructor(@Many(ICustomerService) readonly svc: any[]) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.equal(result.svc.length, 1);
        assert.instanceOf(result.svc[0], NoDependencyCustomerService);
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

    it("Should catch an error when setup a service and continue when not specifying behavior", async () => {
        const expected = new Error("error");
        let catchedError: any;
        let hasContinuedSetup = false;

        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .setup(ICustomerService, _ => { throw expected; })
            .catch(err => {
                catchedError = err;
            })
            .setup(ICustomerService, _ => hasContinuedSetup = true)
            .build();

        await kernel.start();

        assert.equal(catchedError.message, expected.message);
        assert.isTrue(hasContinuedSetup);
    });

    it("Should catch an error when setup a service and continue the setup", async () => {
        const expected = new Error("error");
        let catchedError: any;
        let hasContinuedSetup = false;

        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .setup(ICustomerService, _ => { throw expected; })
            .catch(err => {
                catchedError = err;
                return SetupErrorHandlerResult.continue;
            })
            .setup(ICustomerService, _ => hasContinuedSetup = true)
            .build();

        await kernel.start();

        assert.equal(catchedError.message, expected.message);
        assert.isTrue(hasContinuedSetup);
    });

    it("Should catch an error when setup a service and stop the whole setup", async () => {
        const expected = new Error("error");
        let catchedError: any;
        let hasContinuedSetup = false;

        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .setup(ICustomerService, _ => { throw expected; })
            .catch(err => (catchedError = err, SetupErrorHandlerResult.stop))
            .setup(ICustomerService, _ => hasContinuedSetup = true)
            .build();

        await kernel.start();

        assert.equal(catchedError.message, expected.message);
        assert.isFalse(hasContinuedSetup);
    });

    it("Should not catch an error when setup a service", async () => {
        const expected = new Error("error");
        let observedError: any;
        let catchedError: any;
        let hasContinuedSetup = false;

        const kernel = IoCKernel.create()
            .configure(services => services.addSingleton(NoDependencyCustomerService))
            .setup(ICustomerService, _ => { throw expected; })
            .catch(err => {
                observedError = err;
                return SetupErrorHandlerResult.throw;
            })
            .setup(ICustomerService, _ => hasContinuedSetup = true)
            .build();

        try {
            await kernel.start();
            await kernel.ready;
        }
        catch (err) {
            catchedError = err;
        }

        assert.equal(observedError.message, expected.message);
        assert.equal(catchedError.message, expected.message);
        assert.isFalse(hasContinuedSetup);
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
            .configure(services => services.addSingletonFactory(
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

    it("Should bind properly a factory with explicit id", async () => {
        class CallbackServiceFactory implements IServiceFactory<ICustomerService> {

            static readonly targetType = NoDependencyCustomerService ?? Object as any;

            create(): ICustomerService {
                return new NoDependencyCustomerService();
            }
        }

        const { services } = IoCKernel.create()
            .configure(services => services.addSingletonFactory(ICustomerService, CallbackServiceFactory))
            .build();

        const result = services.get(ICustomerService);

        assert.instanceOf(result, NoDependencyCustomerService);
        assert.equal(await result!.getAddress("bo"), "Hello bo !");
    });

    it("Should keep scoped in their container", async () => {
        const kernel = IoCKernel.create()
            .configure(services => {
                services.addScoped(NoDependencyCustomerService, { scope: ServiceScope.container })
            })
            .build();

        const scopedInstance = new NoDependencyCustomerService();
        scopedInstance.init();

        const childModule = kernel.createChildScope("child")
            .configure(services => {
                const ctor = IServiceFactory.create(ICustomerService, _ => scopedInstance)
                services.addScopedFactory(ctor, { scope: ServiceScope.container })
            })
            .build();

        const deepChildModule = childModule.createChildScope("deep-child").build();

        const kernelResult = [...kernel.services.getAll(ICustomerService)];
        assert.equal(kernelResult.length, 1);
        assert.isFalse(kernelResult[0].initialized);

        const childResult = [...childModule.services.getAll(ICustomerService)];
        assert.equal(childResult.length, 1);
        assert.isTrue(childResult[0].initialized);

        const deepResult = [...deepChildModule.services.getAll(ICustomerService)];
        assert.equal(deepResult.length, 0);
    });

    it("Should compute proper path", async () => {
        const kernel = IoCKernel.create().build();
        assert.equal("root", kernel.name);
        assert.equal("root", kernel.path);

        const childModule = kernel.createChildScope("child").build();
        assert.equal("child", childModule.name);
        assert.equal("root/child", childModule.path);

        const deepChildModule = childModule.createChildScope("deep-child").build();
        assert.equal("deep-child", deepChildModule.name);
        assert.equal("root/child/deep-child", deepChildModule.path);
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
