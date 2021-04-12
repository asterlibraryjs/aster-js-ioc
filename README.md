# @aster-js/ioc

> Documentation in progress

This project provides a standalone dependency injection / inversion of control library.

A more SPA service architecture / ecosystem is built through `@aster-js/app`.

It's compatible with any renderer and enable to structure your code using SOA architecture offering then decoupling, abstration, easy to unit test and modulary to your project.

Let see how difficult it is...

### Create your first services

First of all, its recommanded to declare explicitly the service id and implementation:

#### Step 1: Declaring the service identifier and its contract:

Making use of declaration merge we can declare the Service Identifier and the interface using the same name to simplify futher declarations.

```typescript
export const IHttpService = ServiceIdentifier<IHttpService>("IHttpService");

export interface IHttpService {
    get(url: string): Promise<string>;
}
```

#### Step 2: Create your first implementation

Once you have declared the service id, you are now able to start implement this service:

```typescript
@ServiceContract(IHttpService)
export class HttpService implements IHttpService {
    async get(url: string): Promise<string> {
        const res = await fetch(url);
        return await res.text()
    }
}
```

The `ServiceContract` decorator is optional, but it will be usefull later to reduce the binding declaration enabling auto discovery of the link between the  implementation and its service id.

Explicit `implements` declaration can be removed when using the `@ServiceContract` decorator that already validate by itself the decorated class implements properly the service id interface.

### Step 3: Create your a service without service id

As its not mandatory, only recommanded, no service id is necessary to register something in the IoC.

`@ServiceContract` will be then unexpected.

This time we will also consume the IHttpService.

```typescript
export class CustomerService {

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
    // If a service id is attached, use the service id instead
    // The actual sample demonstrate `CustomerService` as declared without id
    .setup(CustomerService, async svc => await svc.loadAdresses())
    .build();

kernel.start();
```

And obviously, getting an address of a customer like that is a bit overkill.

## See Also
- [Service Factory](./doc/factory.md)
- [Service Provider](./doc/provider.md)
