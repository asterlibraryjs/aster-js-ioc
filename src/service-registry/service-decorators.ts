import { Constructor } from "@aster-js/core";
import { ServiceIdentifier } from "./service-identifier";

export function Optional(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol | undefined, index: number) => void {
    return (target: Constructor, _: string | symbol | undefined, index: number) => {
        ServiceIdentifier.registry.addDependency(target, serviceId, index, "optional");
    };
}

export function Many(serviceId: ServiceIdentifier): (target: Constructor, propertyKey: string | symbol | undefined, index: number) => void {
    return (target: Constructor, _: string | symbol | undefined, index: number) => {
        ServiceIdentifier.registry.addDependency(target, serviceId, index, "many");
    };
}

export function Inject(type: Constructor, optional?: boolean): (target: Constructor, propertyKey: string | symbol | undefined, index: number) => void {
    return (target: Constructor, _: string | symbol | undefined, index: number) => {
        const serviceId = ServiceIdentifier.registry.resolve(type);
        ServiceIdentifier.registry.addDependency(target, serviceId, index, optional ? "optional" : "required");
    };
}

export function InjectMany(type: Constructor): (target: Constructor, propertyKey: string | symbol | undefined, index: number) => void {
    return (target: Constructor, _: string | symbol | undefined, index: number) => {
        const serviceId = ServiceIdentifier.registry.resolve(type);
        ServiceIdentifier.registry.addDependency(target, serviceId, index, "many");
    };
}
