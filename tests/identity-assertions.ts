import { assert } from "chai";
import { ServiceIdentifier, ServiceIdentity } from "../src";


export function assertIdentity(svc: any, serviceId: ServiceIdentifier) {
    const result = ServiceIdentity.get(svc);

    assert.isDefined(result, "Service identity not found");

    assert.equal(result!.desc.serviceId, serviceId, "Service ID mismatch");
}
