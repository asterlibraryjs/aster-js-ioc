import { Many, ServiceContract, ServiceIdentifier } from "../service-registry";
import { IClock } from "./iclock";
import { IIoCModule } from "../ioc-module";

export const ILogger = ServiceIdentifier<ILogger>("ILogger");
export interface ILogger {
    /**
     * Log an event and propagate it over all registered sinks
     * @param logLevel Define the log level
     * @param err Error related to the event. Set as null when not relevant
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    log(logLevel: LogLevel, err: unknown, templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `trace`
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    trace(templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `debug`
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    debug(templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `info`
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    info(templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `warn`
     * @param err Error related to the event. Set as null when not relevant
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    warn(err: unknown, templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `error`
     * @param err Error related to the event. Set as null when not relevant
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    error(err: unknown, templateMessage: string, ...params: any[]): void;
    /**
     * Log an event with a Log Level at `critical`
     * @param err Error related to the event. Set as null when not relevant
     * @param templateMessage Template message that embed into curly braces each following params like this "My message with {MyParam1} and {MyParam2}"
     * @param params Params to inject into the message. Each parameter must be declared only once in order of their apperance in the template message
     */
    critical(err: unknown, templateMessage: string, ...params: any[]): void;
}

export type LogEventPropertyKey = string | typeof LogEvent.extraValues | typeof LogEvent.template;

export type LogEvent = {
    readonly scope: string;
    readonly logLevel: LogLevel;
    readonly message: string;
    readonly properties: Record<LogEventPropertyKey, any>;
    readonly time: Date;
    readonly err?: unknown;
}

export namespace LogEvent {
    export const extraValues = Symbol("extraValues");
    export const template = Symbol("template");
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

    log(logLevel: LogLevel, err: unknown, templateMessage: string, ...params: any[]): void {
        const properties: Record<string | symbol, any> = {};
        const message = templateMessage.replaceAll(/\{([\w]+)\}/gi, (original, key) => {
            if (properties.hasOwnProperty(key)) {
                return properties[key];
            }
            if (params.length) {
                const result = params.shift();
                properties[key] = result;
                return result;
            }
            return original;
        });

        properties[LogEvent.template] = templateMessage;

        if (params.length) {
            properties[LogEvent.extraValues] = params;
        }
        const event: LogEvent = {
            scope: this._iocModule.path,
            time: this._clock.utcNow(),
            logLevel,
            message,
            properties,
            err
        };

        for (const sink of this._sinks) sink.log(event);
    }

    trace(templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.trace, null, templateMessage, ...params);
    }

    debug(templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.debug, null, templateMessage, ...params);
    }

    info(templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.info, null, templateMessage, ...params);
    }

    warn(err: unknown, templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.warn, err, templateMessage, ...params);
    }

    error(err: unknown, templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.error, err, templateMessage, ...params);
    }

    critical(err: unknown, templateMessage: string, ...params: any[]): void {
        this.log(LogLevel.critical, err, templateMessage, ...params);
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

    log({ scope, time, logLevel, message, err, properties }: LogEvent): void {
        if (this.isEnabled(logLevel)) {
            const formatedTime = DateFormat.format(time);
            const log = `[${formatedTime}] [${scope}] ${message}`;

            const args: any[] = [log, properties];
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
