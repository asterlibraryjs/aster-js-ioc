import { Inject, Many, ServiceContract, ServiceIdentifier } from "../src";

export const IHttpService = ServiceIdentifier<IHttpService>("IHttpService");
export interface IHttpService {
    get(url: string): Promise<string>;
}

export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");
export interface ICustomerService {
    readonly initialized: boolean;
    init(): void;
    getAddress(customerId: string): Promise<string>;
}

export const IUIService = ServiceIdentifier<IUIService>("IUIService");
export interface IUIService {
    render(output: string[]): Promise<void>;
}

class Initializable {
    private _initialized: boolean = false;

    get is() { return "Initializable"; }

    get initialized(): boolean { return this._initialized; }

    init(): void {
        this._initialized = true;
        console.debug(this.is);
    }
}

export class HttpClient extends Initializable {

    override get is() { return "HttpClient"; }

    async get(url: string): Promise<string> {
        return `HttpClient data from ${url}`;
    }
}

@ServiceContract(IHttpService)
export class HttpService {
    async get(url: string): Promise<string> {
        return `Data from ${url}`;
    }
}

@ServiceContract(IUIService)
export class UIService {
    constructor(
        private readonly _customerId: string,
        @ICustomerService readonly customerService: ICustomerService
    ) { }

    async render(output: string[]): Promise<void> {
        output.push(
            await this.customerService.getAddress(this._customerId)
        );
    }
}

export class NoContractCustomerService extends Initializable {

    override get is() { return "NoContractCustomerService"; }

    async getAddress(customerId: string): Promise<string> {
        return `Hello ${customerId} ! Not attached here !`;
    }
}

@ServiceContract(ICustomerService)
export class NoDependencyCustomerService extends Initializable {

    override get is() { return "NoDependencyCustomerService"; }

    async getAddress(customerId: string): Promise<string> {
        return `Hello ${customerId} !`;
    }
}

@ServiceContract(ICustomerService)
export class InjectDependencyCustomerService extends Initializable {

    override get is() { return "InjectDependencyCustomerService"; }

    constructor(
        @Inject(HttpClient, true) private readonly _httpClient?: HttpClient
    ) {
        super();
    }

    async getAddress(customerId: string): Promise<string> {
        return await this._httpClient?.get(`/api/customers/${customerId}`)
            ?? "not found";
    }
}

@ServiceContract(ICustomerService)
export class BasicCustomerService extends Initializable {

    override get is() { return "BasicCustomerService"; }

    constructor(
        @IHttpService private readonly _httpService: IHttpService
    ) {
        super();
    }

    async getAddress(customerId: string): Promise<string> {
        return await this._httpService.get(`/api/customers/${customerId}`);
    }
}

@ServiceContract(ICustomerService)
export class AdvancedCustomerService extends Initializable {

    override get is() { return "AdvancedCustomerService"; }

    constructor(
        @Many(ICustomerService) private readonly _customerServices: ICustomerService[]
    ) {
        super();
    }

    async getAddress(customerId: string): Promise<string> {
        const req = this._customerServices
            .filter(svc => svc != this)
            .map(svc => svc.getAddress(customerId));

        const res = await Promise.all(req);
        return res.join("<br/>");
    }
}
