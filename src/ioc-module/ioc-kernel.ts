import { IoCKernelBuilder } from "./ioc-kernel-builder";
import { IoCContainer } from "./ioc-container";

export class IoCKernel extends IoCContainer {

    static create(): IoCKernelBuilder {
        return new IoCKernelBuilder();
    }
}