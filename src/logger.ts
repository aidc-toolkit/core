import { type ISettingsParam, Logger } from "tslog";
import { i18nextCore } from "./locale/i18n.js";

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
            throw new RangeError(i18nextCore.t("Logger.unknownLogLevel", {
                logLevel: untypedLogLevel
            }));
        }
    } else if (untypedLogLevel !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Assume that valid log level has been provided.
        if (Object.values(LogLevels).includes(untypedLogLevel as LogLevel)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Valid log level has been provided.
            typedLogLevel = untypedLogLevel as LogLevel;
        } else {
            throw new RangeError(i18nextCore.t("Logger.unknownLogLevel", {
                logLevel: untypedLogLevel
            }));
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

/**
 * Get a loggable representation of a value. Values are returned unmodified, except as follows:
 * 
 * - Big integers are converted to whole numbers where possible, otherwise as their decimal string representations.
 * - Arrays are limited to a maximum of ten elements. Any array longer than ten elements is replaced with the first four
 * elements, a string of three dots, and the last four elements. This may still create large results for
 * multidimensional arrays.
 * - Errors are converted to objects with `name`, `message`, and `stack` properties.
 * - Symbols are converted to their string representations.
 * - Functions are converted to strings of the form `Function(name)`.
 *
 * @param value
 * Value.
 *
 * @returns
 * Loggable value.
 */
export function loggableValue(value: unknown): unknown {
    let replacementValue: unknown;

    switch (typeof value) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
            replacementValue = value;
            break;

        case "bigint":
            // Big integers not supported in JSON.
            replacementValue = value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER ? Number(value) : value.toString(10);
            break;

        case "object":
            if (value === null) {
                replacementValue = value;
            } else if (Array.isArray(value)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Slicing array is necessary to keep log size down.
                replacementValue = (value.length <= 10 ? value : [...value.slice(0, 4), "...", ...value.slice(-4)]).map(entry => loggableValue(entry));
            } else if (value instanceof Error) {
                replacementValue = loggableValue({
                    name: value.name,
                    message: value.message,
                    stack: value.stack?.split("\n")
                });
            } else {
                // Apply recursively to all properties of the object.
                replacementValue = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, loggableValue(v)]));
            }
            break;

        case "symbol":
            replacementValue = value.toString();
            break;

        case "function":
            replacementValue = `Function(${value.name})`;
            break;
    }

    return replacementValue;
}
