import { Tag } from "@aster-js/core";
import { IServiceProvider } from "./iservice-provider";
import { IServiceDescriptor } from "../service-descriptors/iservice-descriptor";

const _self = Symbol("self");
const _serviceIdentityTag = Tag<ServiceIdentity>("service-identity");
let lastId = 0;

export function setIdentity(target: any, desc: IServiceDescriptor, owner: IServiceProvider): void {
    _serviceIdentityTag.set(target, {
        uuid: ++lastId,
        desc,
        owner
    });
    Reflect.set(target, _self, target);
}

export type ServiceIdentity = {
    readonly uuid: number;
    readonly desc: IServiceDescriptor;
    readonly owner: IServiceProvider;
}

export namespace ServiceIdentity {

    export function isProxy(svc: any): boolean {
        return Reflect.get(svc, _self) === svc;
    }

    export function get(svc: any): ServiceIdentity | undefined {
        const instance = Reflect.get(svc, _self);

        if(typeof instance === "undefined") throw new Error("Service instance is not tagged with identity");

        return _serviceIdentityTag.get(instance);
    }

    export function fullName(svc: any): string | undefined {
        const identity = _serviceIdentityTag.get(svc);
        if (identity) {
            return `${identity.desc.serviceId}`;
        }
    }
}
