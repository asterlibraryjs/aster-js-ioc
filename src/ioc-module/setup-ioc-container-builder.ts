import type { Constructor } from "@aster-js/core";

import type { ServiceIdentifier } from "../service-registry/service-identifier";

import type { IIoCContainerBuilder, ISetupIoCContainerBuilder } from "./iioc-module-builder";
import type { ServiceSetupDelegate, IoCModuleSetupDelegate, IoCModuleConfigureDelegate } from "./iioc-module-builder";
import type { IIoCModule } from "./iioc-module";
import type { SafeIoCModuleSetupAction, SetupErrorHandlerDelegate } from "./setup-actions";

export class SetupIoCContainerBuilder implements ISetupIoCContainerBuilder {

    constructor(
        private readonly _wrapped: IIoCContainerBuilder,
        private readonly _action: SafeIoCModuleSetupAction
    ) { }

    continueWithoutAwaiting(): IIoCContainerBuilder {
        this._action.continueWithoutAwaiting();
        return this._wrapped;
    }

    catch(errorHandler: SetupErrorHandlerDelegate): IIoCContainerBuilder {
        this._action.onError(errorHandler);
        return this._wrapped;
    }

    use(action: IoCModuleSetupDelegate): ISetupIoCContainerBuilder {
        return this._wrapped.use(action);
    }

    setup<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, required?: boolean): ISetupIoCContainerBuilder;
    setup<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, required: boolean = true): ISetupIoCContainerBuilder {
        return this._wrapped.setup(serviceIdOrCtor as ServiceIdentifier<T>, action, required);
    }

    setupMany<T>(serviceId: ServiceIdentifier<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(ctor: Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly?: boolean): ISetupIoCContainerBuilder;
    setupMany<T>(serviceIdOrCtor: ServiceIdentifier<T> | Constructor<T>, action: ServiceSetupDelegate<T>, currentScopeOnly: boolean = true): ISetupIoCContainerBuilder {
        return this._wrapped.setupMany(serviceIdOrCtor as ServiceIdentifier<T>, action, currentScopeOnly);
    }

    configure(action: IoCModuleConfigureDelegate): IIoCContainerBuilder {
        return this._wrapped.configure(action);
    }

    build(): IIoCModule {
        return this._wrapped.build();
    }
}
