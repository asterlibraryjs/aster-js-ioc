import { Constructor, Disposable, IDisposable, Tag } from "@aster-js/core";

import { IServiceAccessor } from "../service-provider/iservice-accessor";

import { Optional } from "./service-decorators";
import { ServiceIdentifier } from "./service-identifier";

const _serviceFactoryTag = Tag<ServiceIdentifier>("serviceFactory");

export const ServiceFactoryTag = _serviceFactoryTag.readOnly();

export interface IServiceFactory<T = any> {
    create(): T;
}

export type ServiceFactoryDelegate<T> = (acc: IServiceAccessor) => T;

export namespace IServiceFactory {

    export function create<T>(
        serviceId: ServiceIdentifier<T>,
        callback: ServiceFactoryDelegate<T>,
        targetType?: Constructor<T>
    ): ServiceFactoryConstructor<T> {

        @ServiceFactory(serviceId)
        class CallbackServiceFactory extends Disposable implements IServiceFactory<T> {

            static readonly targetType = targetType ?? Object as any;

            constructor(
                @Optional(IServiceAccessor) private readonly _serviceAccessor: IServiceAccessor
            ) {
                super();
                this.registerForDispose(_serviceAccessor);
            }

            create(): T {
                return callback(this._serviceAccessor);
            }
        }
        return CallbackServiceFactory;
    }
}

export interface ServiceFactoryConstructor<T = any> extends Constructor<IServiceFactory<T>> {
    readonly targetType: Constructor<T>;
}

export const ServiceFactory = <T>(serviceId: ServiceIdentifier<T>) => {
    return (target: ServiceFactoryConstructor<T>) => {
        _serviceFactoryTag.set(target, serviceId);
    }
}
