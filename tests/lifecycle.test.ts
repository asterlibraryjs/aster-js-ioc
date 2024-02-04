import { assert } from "chai";
import { IDisposable } from "@aster-js/core"
import { IoCKernel, IoCModule, resolveServiceId } from "../src";

describe("Dependency Injection with 1 level of graph resolution", () => {
    class Disposable {
        disposed: boolean = false;
        [Symbol.dispose]() {
            this.disposed = true;
        }
    }

    it("Should dispose properly an empty kernel", async () => {
        const kernel = <IoCKernel>IoCKernel.create().build();

        await kernel.start();

        assert.isFalse(kernel.disposed);

        IDisposable.safeDispose(kernel);

        assert.isTrue(kernel.disposed);
    });

    it("Should dispose properly a kernel and its registered services", async () => {
        const kernel = <IoCKernel>IoCKernel.create().configure(x => x.addScoped(Disposable)).build();

        await kernel.start();

        const svc = kernel.services.get(resolveServiceId(Disposable), true);

        assert.isFalse(kernel.disposed);
        assert.isFalse(svc.disposed);

        IDisposable.safeDispose(kernel);

        assert.isTrue(kernel.disposed);
        assert.isTrue(svc.disposed);
    });

    it("Should dispose properly a kernel and its children", async () => {
        const kernel = <IoCKernel>IoCKernel.create().build();
        await kernel.start();

        const child = <IoCModule>kernel.createChildScope("bob").configure(x => x.addScoped(Disposable)).build();
        await child.start();

        const svc = child.services.get(resolveServiceId(Disposable), true);

        assert.isFalse(kernel.disposed);
        assert.isFalse(child.disposed);
        assert.isFalse(svc.disposed);

        IDisposable.safeDispose(kernel);

        assert.isTrue(kernel.disposed);
        assert.isTrue(child.disposed);
        assert.isTrue(svc.disposed);
    });

});
