import { type ISettingsParam, Logger } from "tslog";

/**
 * Log levels.
 */
export const LogLevels = {
    Silly: 0,
    Trace: 1,
    Debug: 2,
    Info: 3,
    Warn: 4,
    Error: 5,
    Fatal: 6
} as const;

/**
 * Log level key.
 */
export type LogLevelKey = keyof typeof LogLevels;

/**
 * Log level.
 */
export type LogLevel = typeof LogLevels[LogLevelKey];

/**
 * Get the log level enumeration value corresponding to a string or number.
 *
 * @param untypedLogLevel
 * Untyped log level.
 *
 * @returns
 * Typed log level or default `LogLevels.Info` if untyped log level not provided..
 */
export function logLevelOf(untypedLogLevel?: string | number): LogLevel {
    let typedLogLevel: LogLevel;

    if (typeof untypedLogLevel === "string") {
        if (untypedLogLevel in LogLevels) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- String exists as a key.
            typedLogLevel = LogLevels[untypedLogLevel as LogLevelKey];
        } else {
            throw new Error(`Unknown log level ${untypedLogLevel}`);
        }
    } else if (untypedLogLevel !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Assume that valid log level has been provided.
        if (Object.values(LogLevels).includes(untypedLogLevel as LogLevel)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Valid log level has been provided.
            typedLogLevel = untypedLogLevel as LogLevel;
        } else {
            throw new Error(`Unknown log level ${untypedLogLevel}`);
        }
    } else {
        typedLogLevel = LogLevels.Info;
    }

    return typedLogLevel;
}

/**
 * Get a logger with an optional log level. The underlying implementation is
 * [`tslog`](https://tslog.js.org/).
 *
 * @param logLevel
 * Log level as enumeration value or string. Mapped to `minLevel` in settings.
 *
 * @param settings
 * Detailed settings. See [`tslog`](https://tslog.js.org/#/?id=settings) documentation for details.
 *
 * @param logObj
 * Default log object. See [`tslog`](https://tslog.js.org/#/?id=defining-and-accessing-logobj) documentation for
 * details.
 *
 * @returns
 * Logger.
 *
 * @template T
 * Log object type.
 */
export function getLogger<T extends object = object>(logLevel?: string | number, settings?: ISettingsParam<T>, logObj?: T): Logger<T> {
    return new Logger({
        ...settings ?? {},
        minLevel: logLevelOf(logLevel)
    }, logObj);
}
