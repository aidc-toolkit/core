import { AppDataStorage, type AppDataStorageDelegate } from "./app-data-storage.js";
import { BrowserAppDataStorageDelegate } from "./browser-app-data-storage-delegate.js";
import { NoOpAppDataStorageDelegate } from "./no-op-app-data-storage-delegate.js";

/**
 * Local application data storage for the current environment.
 */
export class LocalAppDataStorage extends AppDataStorage {
    /**
     * Get a local application data storage object with an appropriate delegate. This method is asynchronous to prevent
     * node:fs from being imported when running in a browser.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     *
     * @returns
     * Local application data storage object.
     */
    static async get(path?: string): Promise<LocalAppDataStorage> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- localStorage is undefined when running under Node.js.
        const delegate = globalThis.localStorage !== undefined ?
            new BrowserAppDataStorageDelegate() :
            await import("./file-app-data-storage-delegate.js").then(module => module.FileAppDataStorageDelegate.isNodeFSAvailable() ?
                new module.FileAppDataStorageDelegate() :
                new NoOpAppDataStorageDelegate()
            );

        return new LocalAppDataStorage(delegate, path);
    }

    /**
     * @inheritDoc
     */
    private constructor(delegate: AppDataStorageDelegate, path?: string) {
        super(delegate, path);
    }
}
