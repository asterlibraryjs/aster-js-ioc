import { assert } from "chai";
import { spy, assert as sassert, SinonSpy, match } from "sinon";
import { asserts } from "@aster-js/core";
import { IoCKernel, resolveServiceId, ILogger, LogLevel, IClock, IConfiguration, LogEvent } from "../src";

class CustomClock implements IClock {
    now(): Date {
        return new Date(2023, 0, 1, 12, 0, 0, 0);
    }
    utcNow(): Date {
        return new Date(2023, 0, 1, 12, 0, 0, 0);
    }
}

type CustomConfig = { name: string }

class ConfigConsumer {
    private _name: string;

    constructor(@IConfiguration configuration: IConfiguration<CustomConfig>) {
        configuration.onDidUpdated(this.onDidConfigUpdated, this);
        this._name = configuration.values.name;
    }

    getName(): string {
        return this._name;
    }

    private onDidConfigUpdated(key: keyof CustomConfig, value: unknown): void {
        if (key === "name") {
            asserts.ofType(value, "string");
            this._name = value;
        }
    }
}

describe("Core Services", () => {

    let warnSpy: SinonSpy;

    beforeEach(() => { warnSpy = spy(console, "warn"); });

    afterEach(() => { warnSpy.restore(); });

    it("Should Log a warning in the console", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addSingleton(IClock, CustomClock)
                    .addConsoleLogger(LogLevel.trace);
            })
            .build();

        const result = services.get(ILogger, true);
        result.warn(null, "Hello {Name}!!", "Les Petits", false);

        sassert.calledOnce(warnSpy);
        const expectedProperties = { "Name": "Les Petits", [LogEvent.extraValues]: [false], [LogEvent.template]: "Hello {Name}!!" };
        sassert.calledWith(warnSpy, "[12:00:00.000] [root] Hello Les Petits!!", match(expectedProperties));
    });

    it("Should not log a info in the console", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addConsoleLogger(LogLevel.warn);
            })
            .build();

        const result = services.get(ILogger, true);
        result.log(LogLevel.info, null, "Hello !!");

        sassert.notCalled(warnSpy);
    });

    it("Should use configuration", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addConfiguration<CustomConfig>({ name: "bob" })
                    .addScoped(ConfigConsumer);
            })
            .build();

        const serviceId = resolveServiceId(ConfigConsumer);
        const consumer = services.get(serviceId, true);
        const result = consumer.getName();

        assert.equal(result, "bob");
    });

    it("Should use configuration and update it", async () => {
        const { services } = IoCKernel.create()
            .configure(services => {
                services
                    .addConfiguration<CustomConfig>({ name: "bob" })
                    .addScoped(ConfigConsumer);
            })
            .build();


        const serviceId = resolveServiceId(ConfigConsumer);
        const consumer = services.get(serviceId, true);
        const firstResult = consumer.getName();

        assert.equal(firstResult, "bob");

        const config = services.get(IConfiguration, true);
        config.update({ name: "Jose" });
        const secondResult = consumer.getName();

        assert.equal(secondResult, "Jose");
    });

});
