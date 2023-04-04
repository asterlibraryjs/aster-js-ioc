import { ServiceCollection } from "../service-collection/service-collection";
import { SystemClock } from "./iclock";
import { Configuration } from "./iconfiguration";

import { ConsoleLoggerFactory, ILogger, LogLevel } from "./ilogger";

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
    this.tryAddSingleton(SystemClock);
    return this.addTransientFactory(ConsoleLoggerFactory, { baseArgs: [level] });
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
