1. [Implicit identity bound](#implicit_identity_bound)
2. [Explicit identity bound](#explicit_identity_bound)
3. [Anonymous services](#anonymous_services)

<a name="implicit_identity_bound"></a>
## Implicit identity bound

Implicit bound will shorten the configuration syntax
using the `ServiceContract` on the implementation
to specify which service identifier it should be bound to:

```ts
// Service Identifier
export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");
export interface ICustomerService {
    getCustomer(id: string): Promise<Customer>;
}

// Implementation
@ServiceContract(ICustomerService)
export class CustomerService implements ICustomerService {
    getCustomer(id: string): Promise<Customer> {
        return fetch(`/customers/${id}`)
            .then(x => x.json());
    }
}

// Configuration
const {services} = IoCKernel.create()
    .configure(services => services.addSingleton(CustomerService))
    .build();
```

<a name="explicit_identity_bound"></a>
## Explicit identity bound
During configuration, the service identifier can be explicitly provided:

```ts
// Configuration
const {services} = IoCKernel.create()
    .configure(services => services.addSingleton(ICustomerService, CustomerService))
    .build();
```

<a name="anonymous_services"></a>
## Anonymous services
Sometime, we don't want to declare a service identifier for many reasons.
A service can be registered without it.

```ts
// Configuration
const {services} = IoCKernel.create()
    .configure(services => services.addSingleton(CustomerService))
    .configure(services => services.addSingleton(GeneratedHttpClient))
    .build();
```

The main difference reside in the way the service will be injected:

```ts
@ServiceContract(ICustomerService)
export class CustomerService implements ICustomerService {
    // @Inject decorator will resolve the dynamic service identifier assiciated to the implementation
    constructor(@Inject(GeneratedHttpClient) private readonly _httpClient: GeneratedHttpClient){}
    
    getCustomer(id: string): Promise<Customer> {
        return this._httpClient.getCustomer(id);
    }
}
```

Using the service provider to retrieve the instance is also a bit different.
Because the service is assigned a dynamic `ServiceIdentifier`,
you have to first retrieve the identifier:

```ts
const {services} = IoCKernel.create()
    .configure(services => services.addSingleton(CustomerService))
    .configure(services => services.addSingleton(GeneratedHttpClient))
    .build();

const clientServiceId = resolveServiceId(GeneratedHttpClient);
const httpClient = services.get(clientServiceId, true);
```

Always resolving the id can be a bit tedious.
Using `ServiceIdentifier.of` you can create the service identifier once
then use explicit bound to configure the service:

```ts
const GeneratedHttpClientId = ServiceIdentifier.of(GeneratedHttpClient)

const {services} = IoCKernel.create()
    .configure(services => services.addSingleton(CustomerService))
    .configure(services => services.addSingleton(GeneratedHttpClientId, GeneratedHttpClient))
    .build();

// From IServiceProvider
const httpClient = services.get(GeneratedHttpClientId, true);

// From Injection
@ServiceContract(ICustomerService)
export class CustomerService implements ICustomerService {
    
    constructor(@GeneratedHttpClientId private readonly _httpClient: GeneratedHttpClient){}

    getCustomer(id: string): Promise<Customer> {
        return this._httpClient.getCustomer(id);
    }
}
```

