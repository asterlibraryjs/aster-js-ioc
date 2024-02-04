import { assert } from "chai";
import { resolveServiceId, ServiceIdentifier } from "../src";
import { ICustomerService } from "./service.mocks";

describe("Service utils", () => {

    it("Should resolve from actual service id", async () => {
        const result = resolveServiceId(ICustomerService);

        assert.equal(ICustomerService, result);
    });

    it("Should resolve a new service id ", async () => {
        const before = ServiceIdentifier.registry.get(Object);
        assert.isNull(before);

        const result = resolveServiceId(Object);

        const after = ServiceIdentifier.registry.get(Object);
        assert.isNotNull(after);

        assert.equal(after, result);
    });

});
