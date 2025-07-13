## Service Factory

Service factory provide a way to delay and/or customise a service instantiation.

## The short way

### Step 1: Declaring the service type

```ts
import {ServiceIdentifier} from "@aster-js/ioc";

export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");

export interface ICustomerService {
    getCustomer(id: string): Promise<Customer>;
}
```

### Step 2: Declaring the service to construct with the factory
For the sample purpose, we provide the base url of the api using a string.
```ts
import {ICustomerService} from "./icustomer-service";

export class CustomerService implements ICustomerService {

    constructor(private readonly _baseAddress: string){ }

    getCustomer(id: string): Promise<Customer>{
        return fetch(`${this._baseAddress}/customers/${id}`)
            .then(x => x.json())
    }
}
```

### Step 3: Registering the factory
```ts
import {IoCKernel, IServiceFactory, IConfiguration} from "@aster-js/ioc";
import {ICustomerService} from "./icustomer-service";
import {CustomerService} from "./customer-service";

const { services } = IoCKernel.create()
    .configure(services => {
            services.addSingletonFactory(
                // "IServiceFactory.create" will create a factory from a delegate
                IServiceFactory.create(ICustomerService, x => {
                        const config = x.get(IConfiguration, true);
                        const baseAddress = config.values["API_URL"];
                        return new CustomerService(baseAddress);
                    },
                    // Providing in advance the type of the implementation
                    // helps the proxy to better behave and be more lazy
                    CustomerService)
            );
        }
    )
    .setup(IConfiguration, x => x.update({ "API_URL": "https://my-api.com/v1" }))
    .build();

const svc = services.get(ICustomerService);
```

## When things get more complicated

Using the delegate declaration can rapidly make you setup a bit clumsy.

A better way is to dedicate a class in charge of the factory implementation.

```ts
import {IServiceFactory, ServiceFactory, IConfiguration} from "@aster-js/ioc";
import {ICustomerService} from "./icustomer-service";
import {CustomerService} from "./customer-service";

@ServiceFactory(ICustomerService)
export class CustomerServiceFactory implements IServiceFactory<ICustomerService> {

    static readonly targetType = CustomerService;
    
    constructor(@IConfiguration private readonly _config: IConfiguration) { }

    create() {
        const baseAddress = this._config.values["API_URL"];
        return new CustomerService(baseAddress);
    }
}
```

Then registration is getting more simple

```ts
import {IoCKernel, IServiceFactory, IConfiguration} from "@aster-js/ioc";
import {ICustomerService} from "./icustomer-service";
import {CustomerService} from "./customer-service";
import {CustomerServiceFactory} from "./customer-service-factory";

const { services } = IoCKernel.create()
    .configure(services => services.addSingletonFactory(CustomerServiceFactory))
    .setup(IConfiguration, x => x.update({ "API_URL": "https://my-api.com/v1" }))
    .build();

const svc = services.get(ICustomerService);
```