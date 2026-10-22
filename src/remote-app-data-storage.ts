import { ReadOnlyAppDataStorage, ReadOnlyAppDataStorageDelegate } from "./app-data-storage.js";
import { defaultHTTPFetch, HTTP_NOT_FOUND, type HTTPFetch } from "./http-fetch.js";
import { i18nextCoreT } from "./locale/i18n.js";

/**
 * Remote application data storage delegate using HTTP.
 */
export class RemoteAppDataStorageDelegate extends ReadOnlyAppDataStorageDelegate {
    readonly #httpFetch: HTTPFetch;

    /**
     * Constructor.
     *
     * @param httpFetch
     * HTTP fetch function.
     */
    constructor(httpFetch: HTTPFetch) {
        super(true);

        this.#httpFetch = httpFetch;
    }

    /**
     * @inheritDoc
     */
    override async doRead(key: string, asBinary: boolean | undefined): Promise<string | Uint8Array | undefined> {
        const response = await this.#httpFetch(key);

        let result: string | Uint8Array | undefined;

        if (response.ok) {
            result = asBinary === true ? new Uint8Array(await response.arrayBuffer()) : await response.text();
        } else if (response.status === HTTP_NOT_FOUND) {
            result = undefined;
        } else {
            throw new RangeError(i18nextCoreT("RemoteAppDataStorage.httpError", {
                status: response.status
            }));
        }

        return result;
    }
}

/**
 * Remote application data storage using HTTP.
 */
export class RemoteAppDataStorage extends ReadOnlyAppDataStorage<RemoteAppDataStorageDelegate> {
    /**
     * Constructor.
     *
     * @param baseURL
     * Base URL. The URL must not end with a slash.
     *
     * @param httpFetch
     * HTTP fetch function.
     */
    constructor(baseURL: string, httpFetch: HTTPFetch = defaultHTTPFetch) {
        super(new RemoteAppDataStorageDelegate(httpFetch), baseURL);
    }
}
