## ServiceIdentifier

A service identifier is an identifier used to register a service implementation in the module
and retrieve it from the `IServiceProvider` or during the injection.

## Declaring a `ServiceIdentifier`

```ts
export const IHttpClient = ServiceIdentifier("IHttpClient");
```

The declared identifier will miss a bit of typing
so we are going to leverage Typescript declaration merging
to declare the type of the service
and specifying the type in the generic argument of `ServiceIdentifier<T>`:

```ts
export const IHttpClient = ServiceIdentifier<IHttpClient>("IHttpClient");
export interface IHttpClient{
    get(url: string): Promise<unknown>;
    post(url: string, body: string): Promise<unknown>;
}
```

### Options

- `unique`: Indicate whether the name of the service is used as key or if a unique Symbol is used. 
This option is very dangerous when used in the context of a library due badly formed to bundle
that refer to different very of the library and generate different Symbols.
For libraries, it is recommended to use the namespace option,
- `namespace`: The namespace is used to create a root name concatenated with you service name
to avoid conflict with other service name.
A great way to use the namespace is to create a custom `ServiceIdentifier` factory for your project:
```ts
import { ServiceIdentifier } from "@aster-js/ioc";

export function PackageServiceId<T>(name: string): ServiceIdentifier<T> {
    return ServiceIdentifier<T>({ name, namespace: "my-package-name" });
}
```


## `ServiceIdentifier` for external libraries

To register an external library service that does not use aster ioc
but have the same behavior and functionalities as other services in your application,
you can declare a `ServiceIdentifier` this way:

```ts
export const WeatherApiClientId = ServiceIdentifier.of(WeatherApiClient);
```
