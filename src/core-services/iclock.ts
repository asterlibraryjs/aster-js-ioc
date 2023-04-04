import { ServiceContract, ServiceIdentifier } from "../service-registry";

export const IClock = ServiceIdentifier<IClock>("IClock");

export interface IClock {
    now(): Date;
    utcNow(): Date;
}

@ServiceContract(IClock)
export class SystemClock implements IClock {
    now(): Date {
        return new Date();
    }

    utcNow(): Date {
        return new Date(Date.now());
    }
}
