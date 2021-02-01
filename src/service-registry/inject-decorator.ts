import { Constructor } from "@aster-js/core";

import { ServiceContract } from "./service-contract";
import { ServiceRegistry } from "./service-registry";


export function Inject(ctor: Constructor) {
    return ((target: Constructor, _: string | symbol, index: number) => {
        let serviceId = ServiceContract.resolve(ctor, false);
        if(!serviceId) throw new Error(`Service ${ctor} not registered.`);
        ServiceRegistry.addDependency(target, serviceId, index, false);
    });
}