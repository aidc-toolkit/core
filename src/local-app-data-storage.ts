import type { AppDataStorage } from "./app-data-storage.js";

/**
 * Local application data storage class for the current environment. This is a variable representing a `Promise` as the
 * implementing class is loaded dynamically to prevent the inclusion of unnecessary node dependencies in a browser
 * environment.
 */
export const LocalAppDataStorage: Promise<new (path?: string) => AppDataStorage<boolean>> =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- localStorage is undefined when running under Node.js.
    globalThis.localStorage === undefined ?
        import("./file-app-data-storage.js").then(module => module.FileAppDataStorage) :
        import("./browser-app-data-storage.js").then(module => module.BrowserAppDataStorage);
