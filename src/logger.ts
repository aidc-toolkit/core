import { Logger } from "tslog";

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
 * Log level.
 */
export type LogLevel = typeof LogLevels[keyof typeof LogLevels];

/**
 * Get a simple logger with an optional log level.
 *
 * @param logLevel
 * Log level as enumeration value or string if any.
 *
 * @returns
 * Logger.
 */
export function getLogger(logLevel?: string | number): Logger<unknown> {
    let minLevel: number;

    if (typeof logLevel === "string") {
        if (logLevel in LogLevels) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- String exists as a key.
            minLevel = LogLevels[logLevel as keyof typeof LogLevels];
        } else {
            throw new Error(`Unknown log level ${logLevel}`);
        }
    } else {
        minLevel = logLevel ?? LogLevels.Info;
    }

    return new Logger({
        minLevel
    });
}
