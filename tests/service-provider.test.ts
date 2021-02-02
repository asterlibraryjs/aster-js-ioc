import { assert } from "chai";
import { assert as sassert, spy } from "sinon";
import { ServiceIdentifier, IServiceProvider, Optional, ServiceContract, IoCKernel } from "../src";

const ICustomService = ServiceIdentifier<ICustomService>("ICustomService");
interface ICustomService {
    hello(): string;
}

@ServiceContract(ICustomService)
class CustomService {
    hello(): string {
        return "no";
    }
}
export const IHttpService = ServiceIdentifier<IHttpService>("IHttpService");

export interface IHttpService {
    get(url: string): Promise<string>;
}
@ServiceContract(IHttpService)
export class HttpService implements IHttpService {
    async get(url: string): Promise<string> {
        const res = await fetch(url);
        return await res.text()
    }
}
export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");

export interface ICustomerService {
    getAddress(customerId: string): Promise<string>;
}

@ServiceContract(ICustomerService)
export class CustomerService {

    constructor(
        @IHttpService private readonly _httpService: IHttpService
    ) { }

    async getAddress(customerId: string): Promise<string> {
        return await this._httpService.get(`/api/customers/${customerId}`);
    }
}

describe("ServiceCollection", () => {

    it("Should be auto registered in service collection", () => {
        const container = IoCKernel.create().build();

        const result = container.services.get(IServiceProvider);

        assert.equal(result, container.services);
    });

    it("Should throw when service not bound", () => {
        const { services } = IoCKernel.create().build();

        class Bob {
            constructor(@ICustomService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob));
    });

    it("Should inject properly bound service", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        class Bob {
            constructor(@ICustomService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, CustomService);
    });

    it("Should inject properly bound service using service contract", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        class Bob {
            constructor(@ICustomService readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, CustomService);
    });

    it("Should throw an error when not enough arguments", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        class Bob {
            constructor(index: number, @ICustomService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob), /(expected 1 arguments)/);
    });

    it("Should throw an error when too much arguments", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        class Bob {
            constructor(index: number, @ICustomService readonly svc?: any) { }
        }

        assert.throw(() => services.createInstance(Bob, 0, 2), /(expected 1 arguments)/);
    });

    it("Should ignore optional service", () => {
        const { services } = IoCKernel.create().build();

        class Bob {
            constructor(@Optional(ICustomService) readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isUndefined(result.svc);
    });

    it("Should bound optional service", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        class Bob {
            constructor(@Optional(ICustomService) readonly svc?: any) { }
        }

        const result = services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, CustomService);
    });

    it("Should bind properly a factory", () => {
        const { services } = IoCKernel.create()
            .configure(services => services.addSingleton(
                ICustomService.factory(acc => {
                    const provider = acc.get(IServiceProvider, true);
                    return provider.createInstance(CustomService);
                }, CustomService)
            ))
            .build();

        const createInstanceSpy = spy(services, "createInstance");

        const result = services.get(ICustomService);

        sassert.calledOnce(createInstanceSpy);
        assert.instanceOf(result, CustomService);
        assert.equal(result!.hello(), "no");
    });

    it("Should create a child module", () => {
        const container = IoCKernel.create()
            .configure(services => services.addSingleton(CustomService))
            .build();

        const childScope = container.createScope("child").build();

        class Bob {
            constructor(@ICustomService readonly svc: any) { }
        }

        const result = childScope.services.createInstance(Bob);

        assert.isDefined(result.svc);
        assert.instanceOf(result.svc, CustomService);
    });
});
