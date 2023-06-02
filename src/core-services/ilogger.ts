import { Constructor } from "@aster-js/core";
import { IServiceFactory, ServiceFactory, ServiceIdentifier } from "../service-registry";
import { IClock } from "./iclock";
import { IIoCModule } from "../ioc-module";

export const ILogger = ServiceIdentifier<ILogger>("ILogger");

export interface ILogger {
    log(level: LogLevel, message: string, err?: any): void;
    isEnabled(logLevel: LogLevel): boolean;
}

export const enum LogLevel {
    trace,
    debug,
    info,
    warn,
    error,
    critical
}

const DateFormat = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h24",
    fractionalSecondDigits: 3
});

class ConsoleLogger implements ILogger {
    constructor(
        private readonly _name: string,
        private _level: LogLevel,
        @IClock private readonly _clock: IClock
    ) { }

    log(logLevel: LogLevel, message: string, err?: any): void {
        if (this.isEnabled(logLevel)) {
            const time = DateFormat.format(this._clock.now());
            const log = `[${this._name}] [${time}] ${message}`;
            switch (logLevel) {
                case LogLevel.trace:
                    console.trace(log);
                    break;
                case LogLevel.debug:
                    console.debug(log);
                    break;
                case LogLevel.info:
                    console.info(log);
                    break;
                case LogLevel.warn:
                    console.warn(log);
                    break;
                case LogLevel.error:
                case LogLevel.critical:
                    console.error(log);
                    break;
                default:
                    console.log(message);
                    break;
            }
        }
    }

    isEnabled(logLevel: LogLevel): boolean {
        return logLevel >= this._level;
    }
}

@ServiceFactory(ILogger)
export class ConsoleLoggerFactory implements IServiceFactory {
    static readonly targetType: Constructor = ConsoleLogger;

    constructor(
        private readonly _level: LogLevel,
        @IIoCModule private readonly _module: IIoCModule,
        @IClock private readonly _clock: IClock){

    }

    create(): any {
        return new ConsoleLogger(this._module.name, this._level, this._clock )
     }
}
