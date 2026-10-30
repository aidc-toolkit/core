import { AppDataStorageDelegate } from "./app-data-storage.js";

/**
 * Application data storage delegate using the browser local storage.
 */
export class BrowserAppDataStorageDelegate extends AppDataStorageDelegate {
    /**
     * Constructor.
     */
    constructor() {
        super(false);
    }

    /**
     * @inheritDoc
     */
    override doRead(key: string): string | undefined {
        return localStorage.getItem(key) ?? undefined;
    }

    /**
     * @inheritDoc
     */
    override doWrite(key: string, s: string): void {
        localStorage.setItem(key, s);
    }

    /**
     * @inheritDoc
     */
    override doDelete(key: string): void {
        localStorage.removeItem(key);
    }
}
