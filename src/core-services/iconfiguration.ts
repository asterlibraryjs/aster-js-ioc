import { DisposableHost, IDisposable } from "@aster-js/core";
import { EventEmitter, IEvent } from "@aster-js/events";
import { ServiceContract, ServiceIdentifier } from "../service-registry";

export const IConfiguration = ServiceIdentifier<IConfiguration>({ namespace: "@aster-js/ioc", name: "IConfiguration", unique: true });

export interface IConfiguration<T = unknown> extends IDisposable {

    readonly values: Readonly<T>;

    readonly onDidUpdated: IEvent<[key: keyof T, newValue: any]>;

    update(config: Partial<T>): void;
}

@ServiceContract(IConfiguration)
export class Configuration<T> extends DisposableHost implements IConfiguration<T> {
    private readonly _onDidUpdated: EventEmitter<[key: keyof T, newValue: any]>;
    private _config: Readonly<T>;

    get values(): Readonly<T> { return this._config; }

    get onDidUpdated(): IEvent<[key: keyof T, newValue: any]> { return this._onDidUpdated.event; }

    constructor(config: Readonly<T>) {
        super();
        this._config = structuredClone(config);
        this.registerForDispose(
            this._onDidUpdated = new EventEmitter()
        );
    }

    update(config: Partial<T>): void {
        for (const [key, value] of Object.entries(config)) {
            Object.assign(this._config, { [key]: structuredClone(config) });
            this._onDidUpdated.emit(key as keyof T, value);
        }
    }
}
