import { Many, ServiceContract, ServiceIdentifier } from "../service-registry";
import { IClock } from "./iclock";
import { IIoCModule } from "../ioc-module";

export const ILogger = ServiceIdentifier<ILogger>("ILogger");
export interface ILogger {
    log(logLevel: LogLevel, message: string, err?: unknown): void;
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string, err?: any): void;
    error(message: string, err?: any): void;
    critical(message: string, err?: any): void;
}

export type LogEvent = {
    readonly scope: string;
    readonly logLevel: LogLevel;
    readonly message: string;
    readonly time: Date;
    readonly err?: unknown;
}

export const ILoggerSink = ServiceIdentifier<ILoggerSink>("ILoggerSink");
export interface ILoggerSink {
    log(event: LogEvent): void;
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

@ServiceContract(ILogger)
export class DefaultLogger {
    constructor(
        @IIoCModule private readonly _iocModule: IIoCModule,
        @IClock private readonly _clock: IClock,
        @Many(ILoggerSink) private readonly _sinks: ILoggerSink[]
    ) { }

    log(logLevel: LogLevel, message: string, err?: unknown): void {
        const event = {
            scope: this._iocModule.path,
            time: this._clock.utcNow(),
            logLevel,
            message,
            err
        } as LogEvent;

        for (const sink of this._sinks) sink.log(event);
    }

    trace(message: string): void {
        this.log(LogLevel.trace, message);
    }

    debug(message: string): void {
        this.log(LogLevel.debug, message);
    }

    info(message: string): void {
        this.log(LogLevel.info, message);
    }

    warn(message: string, err?: any): void {
        this.log(LogLevel.warn, message, err);
    }

    error(message: string, err?: any): void {
        this.log(LogLevel.error, message, err);
    }

    critical(message: string, err?: any): void {
        this.log(LogLevel.critical, message, err);
    }
}

const DateFormat = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h24",
    fractionalSecondDigits: 3
});


@ServiceContract(ILoggerSink)
export class ConsoleLoggerSink implements ILoggerSink {
    constructor(
        private _level: LogLevel
    ) { }

    log({ scope, time, logLevel, message, err }: LogEvent): void {
        if (this.isEnabled(logLevel)) {
            const formatedTime = DateFormat.format(time);
            const log = `[${formatedTime}] [${scope}] ${message}`;

            const args: any[] = [log];
            if (err) args.push(err);
            switch (logLevel) {
                case LogLevel.trace:
                    console.trace(...args);
                    break;
                case LogLevel.debug:
                    console.debug(...args);
                    break;
                case LogLevel.info:
                    console.info(...args);
                    break;
                case LogLevel.warn:
                    console.warn(...args);
                    break;
                case LogLevel.error:
                case LogLevel.critical:
                    console.error(...args);
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
