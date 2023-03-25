import { assert } from "chai";
import { IoCKernel, isServiceProxy, ServiceProxy } from "../src";
import { BasicCustomerService, HttpClient, HttpService, ICustomerService, IHttpService, InjectDependencyCustomerService, IUIService, UIService } from "./service.mocks";

describe("ServiceProxy", () => {

    it("Should create a proper service proxy", async () => {
        const instance = { id: 0, show() { return true; } }
        const { proxy } = new ServiceProxy(instance);

        assert.equal(0, proxy.id);
        assert.isTrue(proxy.show());
        assert.isTrue(isServiceProxy(proxy));
    });

});
