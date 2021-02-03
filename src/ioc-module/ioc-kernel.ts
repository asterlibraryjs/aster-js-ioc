import { IoCKernelBuilder } from "./ioc-kernel-builder";
import { IoCModuleBase } from "./ioc-module-base";

export class IoCKernel extends IoCModuleBase {

    static create(): IoCKernelBuilder {
        return new IoCKernelBuilder();
    }
}