import { Constructor } from "@aster-js/core";
import { ServiceIdentifier } from "./service-identifier";

import { ServiceRegistry } from "./service-registry";

export function Optional(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        ServiceRegistry.addDependency(target, serviceId, index, "optional");
    };
}

export function Many(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        ServiceRegistry.addDependency(target, serviceId, index, "many");
    };
}

export function Inject(type: Constructor, optional?: boolean): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        const serviceId = ServiceRegistry.resolve(type);
        ServiceRegistry.addDependency(target, serviceId, index, optional ? "optional" : "required");
    };
}

export function InjectMany(type: Constructor): (target: Constructor, propertyKey: string | symbol, index: number) => void {
    return (target: Constructor, _: string | symbol, index: number) => {
        const serviceId = ServiceRegistry.resolve(type);
        ServiceRegistry.addDependency(target, serviceId, index, "many");
    };
}
