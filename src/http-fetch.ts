import type { Promisable } from "./type.js";

/**
 * HTTP status code for OK.
 */
export const HTTP_OK = 200;

/**
 * HTTP status code for not found.
 */
export const HTTP_NOT_FOUND = 404;

/**
 * Generic HTTP response.
 */
export interface HTTPResponse {
    /**
     * True if OK.
     */
    readonly ok: boolean;

    /**
     * HTTP status code.
     */
    readonly status: number;

    /**
     * Body as array buffer.
     */
    readonly arrayBuffer: () => Promisable<ArrayBuffer>;

    /**
     * Body as text.
     */
    readonly text: () => Promisable<string>;
}

/**
 * HTTP fetch function.
 */
export type HTTPFetch = (url: string) => Promisable<HTTPResponse>;

/**
 * Default HTTP fetch function using global `fetch` function.
 *
 * @param url
 * URL.
 *
 * @returns
 * HTTP response.
 */
export async function defaultHTTPFetch(url: string): Promise<HTTPResponse> {
    return fetch(url).then(response => ({
        ok: response.ok,
        status: response.status,
        arrayBuffer: async () => response.arrayBuffer(),
        text: async () => response.text()
    }));
}
