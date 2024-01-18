import { ServiceScope } from "src/service-descriptors";
import { ServiceCollection } from "../service-collection/service-collection";
import { IClock, SystemClock } from "./iclock";
import { IConfiguration, Configuration } from "./iconfiguration";

import { DefaultLogger, ConsoleLoggerSink, ILogger, ILoggerSink, LogEvent, LogLevel } from "./ilogger";

interface IServiceCollectionCoreServicesExtensions {
    /** Add the ConsoleLogger */
    addConsoleLogger(this: ServiceCollection, level: LogLevel): ServiceCollection;
    /** Add the system clock */
    addSystemClock(this: ServiceCollection): ServiceCollection;
    /** Add configuration service */
    addConfiguration<T>(this: ServiceCollection, config: T): ServiceCollection;
}

declare module "../service-collection/service-collection" {
    interface ServiceCollection extends IServiceCollectionCoreServicesExtensions { }
}

function addConsoleLogger(this: ServiceCollection, level: LogLevel): ServiceCollection {
    return this
        .addSystemClock()
        .addSingleton(ConsoleLoggerSink, { baseArgs: [level] })
        .addScoped(DefaultLogger);
}

function addSystemClock(this: ServiceCollection): ServiceCollection {
    return this.addSingleton(SystemClock);
}

function addConfiguration<T>(this: ServiceCollection, config: T): ServiceCollection {
    return this.addSingleton(Configuration, { baseArgs: [config] });
}

Object.assign(ServiceCollection.prototype, <IServiceCollectionCoreServicesExtensions>{
    addConsoleLogger, addSystemClock, addConfiguration
});

export { DefaultLogger, ConsoleLoggerSink, ILogger, ILoggerSink, LogEvent, LogLevel, IConfiguration, IClock };
