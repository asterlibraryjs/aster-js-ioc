## Service Provider

ServiceProvider is an actual service that provide access to other services and who is in charge of instantiate all services.

## Manual service retrieval

```ts
import {IServiceProvider} from "@aster-js/ioc";

class FooService {
    constructor(@IServiceProvider private readonly _serviceProvider: IServiceProvider) { }
    
    foo(){
        // Optional service, will return undefined if not exists
        const barServiceOrUndefined = this._serviceProvider.get(IBarService);
        // Required service, will throw if not exists
        const barService = this._serviceProvider.get(IBarService, true);
        // Gets an array of all registered implementation.
        const barServices = this._serviceProvider.getAll(IBarService, true);
    }
}
```

## Custom instantiation

This method is used to instantiate and inject an implementation not registered in the module.


```ts
import {IServiceProvider} from "@aster-js/ioc";

class FooService {
    constructor(@IServiceProvider private readonly _serviceProvider: IServiceProvider) { }
    
    foo(){
        const barService = this._serviceProvider.createInstance(BarService);
    }
}
```

You can also do this in two-step for repeating instantiations:

```ts
class Bar {
    constructor(readonly index: number, @ILogger readonly logger: ILogger) { }
}

class FooService {
    constructor(@IServiceProvider private readonly _serviceProvider: IServiceProvider) { }

    * foo(size: number): Iterable<Bar> {
        const barCtor = this._serviceProvider.resolve(Bar);
        for (let i = 0; i < 0; i++) {
            yield barCtor(i);
        }
    }
}
```