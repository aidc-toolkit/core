import { fromByteArray, toByteArray } from "base64-js";

/**
 * Application data.
 */
export type AppData = string | number | boolean | object;

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
 * Encode an object to a format suitable for storage.
 *
 * @param o
 * Object.
 *
 * @returns
 * Object suitable for storage with date/time and binary types encoded as strings.
 */
function encodeObject(o: object): object | string {
    let mappedData: object | string;

    // Encode date/time and binary array as string and pass through other values unmodified.
    if (o instanceof Date) {
        mappedData = `dateTime:${o.toISOString()}`;
    } else if (o instanceof Uint8Array) {
        mappedData = `binary:${fromByteArray(o)}`;
    } else {
        mappedData = Object.fromEntries(Object.entries(o).map(([key, value]: [string, unknown]) =>
            [key, typeof value === "object" && value !== null ? encodeObject(value) : value]
        ));
    }

    return mappedData;
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
    return JSON.stringify(typeof appData !== "object" ? appData : encodeObject(appData));
}
