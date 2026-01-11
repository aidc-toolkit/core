import type { AppDataStorage } from "./app-data-storage.js";

/**
 * Get the local application data storage class for the current environment. The function is asynchronous as the
 * implementing class is loaded dynamically to prevent the inclusion of unnecessary node dependencies in a browser
 * environment.
 *
 * @returns
 * Local application data storage class.
 */
export const LocalAppDataStorage: Promise<new (path?: string) => AppDataStorage<boolean>> =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- localStorage is undefined when running under Node.js.
    globalThis.localStorage === undefined ?
        import("./file-app-data-storage.js").then(module => module.FileAppDataStorage) :
        import("./browser-app-data-storage.js").then(module => module.BrowserAppDataStorage);
