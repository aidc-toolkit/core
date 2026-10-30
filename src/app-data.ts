import { fromByteArray, toByteArray } from "base64-js";

/**
 * Application data.
 */
export type AppData<T = object> = string | number | boolean | Date | Uint8Array | AppData[] | {
    [K in keyof T]: AppData;
};

/**
 * Decode application data from an encoded string.
 *
 * @param stringData
 * String data.
 *
 * @returns
 * Decoded application data.
 */
export function decodeAppData(stringData: string): AppData | undefined {
    let decodedAppData: AppData | undefined;

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Mapping is expected to be correct.
        decodedAppData = JSON.parse(stringData, (_key, value: unknown) => {
            // Assume replacement value is the original value.
            let replacementValue = value;

            // Decode string representing date/time and binary array and pass through other values unmodified.
            if (typeof value === "string") {
                // First capture group is type, second is data; simple split at ':' character.
                const stringDataGroups = /^(?<type>\w+):(?<data>.*)$/u.exec(value)?.groups;

                if (stringDataGroups !== undefined) {
                    const type = stringDataGroups["type"];
                    const data = stringDataGroups["data"];

                    switch (type) {
                        case "dateTime":
                            replacementValue = new Date(data);
                            break;

                        case "binary":
                            replacementValue = toByteArray(data);
                            break;
                    }
                }
            }

            return replacementValue;
        }) as AppData;
    } catch {
        // String data is not valid JSON; discard it.
        decodedAppData = undefined;
    }

    return decodedAppData;
}

/**
 * Encode application data as a string for storage. Encoded string is in JSON format with date/time and binary data
 * converted to identifiable strings for decoding.
 *
 * @param appData
 * Application data.
 *
 * @returns
 * Encoded application data.
 */
export function encodeAppData(appData: AppData): string {
    /**
     * Preprocess application data for storage. This is necessary because the {@linkcode JSON.stringify} method
     * stringifies {@linkcode Date} objects prior to calling the replacer.
     *
     * @param appData
     * Application data.
     *
     * @returns
     * Application data with date/time and binary data encoded as strings.
     */
    function preprocess(appData: AppData): AppData {
        // Assume no preprocessing required.
        let preprocessedAppData = appData;

        if (typeof appData === "object") {
            // Encode date/time and binary array as string and pass through other values unmodified.
            if (appData instanceof Date) {
                preprocessedAppData = `dateTime:${appData.toISOString()}`;
            } else if (appData instanceof Uint8Array) {
                preprocessedAppData = `binary:${fromByteArray(appData)}`;
            } else if (Array.isArray(appData)) {
                preprocessedAppData = appData.map(preprocess);
            } else {
                preprocessedAppData = Object.fromEntries(Object.entries(appData).map(([key, value]: [string, AppData]) =>
                    [key, preprocess(value)]
                ));
            }
        }

        return preprocessedAppData;
    }

    return JSON.stringify(preprocess(appData));
}
