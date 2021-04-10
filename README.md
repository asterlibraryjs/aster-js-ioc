# @aster-js/ioc

> Documentation in progress

This project provides a standalone dependency injection / inversion of control library.

It's compatible with any renderer and enable to structure your code using SOA architecture offering then decoupling, abstration, easy to unit test and modulary to your project.

### Quick sample

```typescript
@ServiceContract(ICustomerService)
export class CustomerService implements ICustomerService {

    addresses: Address[];

    constructor(
        @Inject(HttpClient) private readonly _httpClient: HttpClient,
        @ICustomerService private readonly _customerService: ICustomerService
    ){}

    async loadAdresses(): Promise<void> {
        this.addresses = await this._httpService.get(`/api/customers/addresses`);
    }
}
```

- [Basics](./doc/basics.md)
- [Factory](./doc/factory.md)
- [Provider](./doc/provider.md)
