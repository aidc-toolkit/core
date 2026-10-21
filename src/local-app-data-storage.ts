import * as fs from "node:fs";
import { AppDataStorage } from "./app-data-storage.js";
import { BrowserAppDataStorageDelegate } from "./browser-app-data-storage-delegate.js";
import { FileAppDataStorageDelegate } from "./file-app-data-storage-delegate.js";
import { NoOpAppDataStorageDelegate } from "./no-op-app-data-storage-delegate.js";

/**
 * Local application data storage for the current environment.
 */
export class LocalAppDataStorage extends AppDataStorage {
    /**
     * Constructor.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     */
    constructor(path?: string) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- localStorage is undefined when running under Node.js.
        const delegate = localStorage !== undefined ?
            new BrowserAppDataStorageDelegate() :
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Condition is true in polyfilled environment.
            fs?.promises?.readFile !== undefined ?
                new FileAppDataStorageDelegate() :
                new NoOpAppDataStorageDelegate();

        super(delegate, path);
    }
}
