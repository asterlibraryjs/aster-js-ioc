import { assert } from "chai";
import { isLazyProxy } from "@aster-js/core"
import { IServiceFactory, Inject, IoCKernel, resolveServiceId } from "../src";
import { BasicCustomerService, HttpClient, HttpService, ICustomerService, IHttpService, InjectDependencyCustomerService, IUIService, UIService } from "./service.mocks";
import { Iterables } from "@aster-js/iterators";

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

        const all = services.getOwnDescriptors(IHttpService);
        const desc = Iterables.first(all)!;

        assert.isUndefined(services.getOwnInstance(desc));

        await result.render([]);

        assert.instanceOf(services.getOwnInstance(desc), HttpService);
    });

    it("Should retrieve local service when scoped initialized from children", async () => {
        class Service1 {
            constructor(readonly id: number) { }
        }
        class Service2 {
            constructor(@Inject(Service1) readonly instance: Service1) { }
        }
        const kernel = IoCKernel.create()
            .configure(x => {
                x
                    .addScoped(Service2)
                    .addScopedFactory(IServiceFactory.create(resolveServiceId(Service1), _ => new Service1(2)));
            })
            .build();
        const child = kernel.createChildScope("child")
            .configure(services => {
                services
                    .addScopedFactory(IServiceFactory.create(resolveServiceId(Service1), _ => new Service1(1)));
            })
            .build();

        const rootInstance1 = kernel.services.get(resolveServiceId(Service1), true);
        assert.equal(rootInstance1.id, 2);

        const childInstance1 = child.services.get(resolveServiceId(Service1), true);
        assert.equal(childInstance1.id, 1);

        const rootInstance2 = kernel.services.get(resolveServiceId(Service2), true);
        assert.equal(rootInstance2.instance, rootInstance1);

        const childInstance2 = child.services.get(resolveServiceId(Service2), true);
        assert.equal(childInstance2.instance, childInstance1);
    });
});
