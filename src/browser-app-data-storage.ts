import { AppDataStorage } from "./app-data-storage.js";

/**
 * Application data storage using the browser local storage.
 */
export class BrowserAppDataStorage extends AppDataStorage<false> {
    /**
     * Constructor.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     */
    constructor(path?: string) {
        super(false, path);
    }

    /**
     * @inheritDoc
     */
    protected override doRead(key: string): string | undefined {
        return localStorage.getItem(key) ?? undefined;
    }

    /**
     * @inheritDoc
     */
    protected override doWrite(key: string, s: string): void {
        localStorage.setItem(key, s);
    }

    /**
     * @inheritDoc
     */
    protected override doDelete(key: string): void {
        localStorage.removeItem(key);
    }
}
