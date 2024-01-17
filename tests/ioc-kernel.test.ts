import { assert } from "chai";
import { IoCKernel } from "../src";
import { AbortToken } from "@aster-js/async";

describe("IoCKernel", () => {

    it("Should build properly an empty kernel", () => {
        const kernel = IoCKernel.create().build();

        assert.isFalse(kernel.running);
        assert.equal(AbortToken.none, kernel.abortToken);
    });
});
