## IoC Module

This is very small module that will help you to implement a proper Inversion of Control accros your service ecosystem.

Let see how difficult it is...

### Create your first services

First of all, you need services, let see how to declare a service:

#### Step 1: Declaring the service identifier and its contract:

Make use of namespace merge and make the Service Identifier having the same name.

```typescript
export const IHttpService = ServiceIdentifier<IHttpService>("IHttpService");

export interface IHttpService {
    get(url: string): Promise<string>;
}
```

#### Step 2: Create your first implementation

Once you have declared the service id, you now able to start implement this service:

```typescript
@ServiceContract(IHttpService)
export class HttpService implements IHttpService {
    async get(url: string): Promise<string> {
        const res = await fetch(url);
        return await res.text()
    }
}
```

The `ServiceContract` decorator is optional, but it will be usefull later to reduce the binding declaration.

### Step 3: Create your second service

Declaration...

```typescript
export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");

export interface ICustomerService {
    getAddress(customerId: string): Promise<string>;
}
```

Implementation, but this time we will consume the IHttpService, let see how we will declare the service to be properly injected later:

```typescript
@ServiceContract(ICustomerService)
export class CustomerService implements ICustomerService {

    addresses: Address[];

    constructor(
        @IHttpService private readonly _httpService: IHttpService
    ){}

    async loadAdresses(): Promise<void> {
        this.addresses = await this._httpService.get(`/api/customers/addresses`);
    }
}
```

### Create an IoCContainer

Once you have all your services declared, you can now create your service container:

```typescript
const kernel = IoCKernel.create()
    .configure(services => {
        services
            .addSingleton(CustomerService)
            .addSingleton(HttpService);
    })
    .use(ICustomerService, async svc => await svc.loadAdresses())
    .build();

kernel.start();
```

And obviously, getting an address of a customer like that is a bit overkill.

## See Also
- [Service Factory](./packages/ioc/factory.md)
- [Service Provider](./packages/ioc/factory.md)