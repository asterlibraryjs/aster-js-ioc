import { ServiceIdentifier } from "../service-registry";

export class InstantiationError extends Error {
    constructor(serviceId: ServiceIdentifier, err: Error) {
        super(`Error during service instantiation for service id "${serviceId}": ${err.message}`, { cause: err });
    }
}
