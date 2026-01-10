import { ReadOnlyAppDataStorage } from "./app-data-storage.js";
import { i18nextCore } from "./locale/i18n.js";

/**
 * Remote application data storage using HTTP. The `store()` and `delete()` methods are not supported.
 */
export class RemoteAppDataStorage extends ReadOnlyAppDataStorage<true> {
    /**
     * Constructor.
     *
     * @param baseURL
     * Base URL. The URL must not end with a slash.
     */
    constructor(baseURL: string) {
        super(true, baseURL);
    }

    /**
     * @inheritDoc
     */
    protected override async doRead(key: string, asBinary: boolean | undefined): Promise<string | Uint8Array | undefined> {
        return fetch(key).then(async (response) => {
            let result: string | Uint8Array | undefined;

            if (response.ok) {
                result = asBinary === true ? new Uint8Array(await response.arrayBuffer()) : await response.text();
            } else if (response.status === 404) {
                result = undefined;
            } else {
                throw new RangeError(i18nextCore.t("RemoteAppDataStorage.httpError", {
                    status: response.status
                }));
            }

            return result;
        });
    }
}
