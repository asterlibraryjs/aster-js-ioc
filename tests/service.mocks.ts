import { Many, ServiceContract, ServiceIdentifier } from "../src";

export const IHttpService = ServiceIdentifier<IHttpService>("IHttpService");
export interface IHttpService {
    get(url: string): Promise<string>;
}

export const ICustomerService = ServiceIdentifier<ICustomerService>("ICustomerService");
export interface ICustomerService {
    getAddress(customerId: string): Promise<string>;
}

@ServiceContract(IHttpService)
export class HttpService {
    async get(url: string): Promise<string> {
        return `Data from ${url}`;
    }
}

@ServiceContract(ICustomerService)
export class NoDependencyCustomerService {
    async getAddress(customerId: string): Promise<string> {
        return `Hello ${customerId} !`;
    }
}

@ServiceContract(ICustomerService)
export class BasicCustomerService {
    constructor(
        @IHttpService private readonly _httpService: IHttpService
    ) { }

    async getAddress(customerId: string): Promise<string> {
        return await this._httpService.get(`/api/customers/${customerId}`);
    }
}

@ServiceContract(ICustomerService)
export class AdvancedCustomerService {
    constructor(
        @Many(ICustomerService) private readonly _customerServices: ICustomerService[]
    ) { }
    async getAddress(customerId: string): Promise<string> {
        const req = this._customerServices
            .filter(svc => svc != this)
            .map(svc => svc.getAddress(customerId));
            
        const res = await Promise.all(req);
        return res.join("<br/>");
    }
}
