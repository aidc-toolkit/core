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
 * Log level as enumeration value or string. Mapped to `minLevel` and sets `hideLogPositionForProduction` to true in
 * settings if at {@linkcode LogLevels.Info} or higher. Default is {@linkcode LogLevels.Info}.
 *
 * @param settings
 * Detailed settings. See [`tslog`](https://tslog.js.org/#/?id=settings) documentation for details. The `minLevel` is
 * ignored in favour of `logLevel` but `hideLogPositionForProduction` will override the default logic.
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
    const minLevel = logLevelOf(logLevel);

    return new Logger({
        // Hiding log position for production can be overridden in settings parameter.
        hideLogPositionForProduction: minLevel >= LogLevels.Info,
        ...settings ?? {},
        // Minimum log level overrides settings parameter.
        minLevel
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

/**
 * Logger transport that stores messages in memory.
 */
export class MemoryTransport<T extends object> {
    /**
     * Notification callbacks map.
     */
    readonly #notificationCallbacksMap = new Map<string, (message: string | undefined, messages: readonly string[]) => void>();

    /**
     * Messages.
     */
    readonly #messages: string[] = [];

    /**
     * Maximum length of messages array.
     */
    #maximumLength = 0;

    /**
     * Length to which messages array is truncated when maximum is reached.
     */
    #truncateLength = 0;

    /**
     * Constructor.
     *
     * @param logger
     * Logger.
     *
     * @param maximumLength
     * Maximum length of messages array.
     *
     * @param truncateLength
     * Length to which messages array is truncated when maximum is reached. Default is 50% of `maximumLength`, maximum
     * is 80% of `maximumLength`.
     */
    constructor(logger: Logger<T>, maximumLength: number, truncateLength?: number) {
        this.resize(maximumLength, truncateLength);

        logger.attachTransport((logObject) => {
            // Truncate logger messages if necessary.
            if (this.#messages.length >= this.#maximumLength) {
                this.#messages.splice(0, this.#maximumLength - this.#truncateLength);
            }

            const message = JSON.stringify(logObject);

            this.#messages.push(message);

            // Notify all registered callbacks.
            for (const notificationCallback of this.#notificationCallbacksMap.values()) {
                notificationCallback(message, this.#messages);
            }
        });
    }

    /**
     * Get the messages.
     */
    get messages(): string[] {
        return this.#messages;
    }

    /**
     * Get the maximum length of messages array.
     */
    get maximumLength(): number {
        return this.#maximumLength;
    }

    /**
     * Get the length to which messages array is truncated when maximum is reached.
     */
    get truncateLength(): number {
        return this.#truncateLength;
    }

    /**
     * Add a notification callback. If one already exists under the current name, do nothing.
     *
     * @param name
     * Callback name.
     *
     * @param notificationCallback
     * Callback.
     *
     * @returns
     * True if successfully added.
     */
    addNotificationCallback(name: string, notificationCallback: (message: string | undefined, messages: readonly string[]) => void): boolean {
        const added = !this.#notificationCallbacksMap.has(name);

        if (added) {
            this.#notificationCallbacksMap.set(name, notificationCallback);

            // Notify with existing messages.
            notificationCallback(undefined, this.#messages);
        }

        return added;
    }

    /**
     * Remove a notification callback.
     *
     * @param name
     * Callback name.
     */
    removeNotificationCallback(name: string): void {
        this.#notificationCallbacksMap.delete(name);
    }

    /**
     * Resize the messages array.
     *
     * @param maximumLength
     * Maximum length of messages array.
     *
     * @param truncateLength
     * Length to which messages array is truncated when maximum is reached. Default is 50% of `maximumLength`, maximum
     * is 80% of `maximumLength`.
     */
    resize(maximumLength: number, truncateLength?: number): void {
        this.#maximumLength = maximumLength;
        this.#truncateLength = truncateLength !== undefined ? Math.min(truncateLength, Math.floor(maximumLength * 0.8)) : Math.floor(maximumLength / 2);
    }
}
