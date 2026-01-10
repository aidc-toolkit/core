import * as fs from "node:fs";
import * as path from "node:path";
import { AppDataStorage } from "./app-data-storage.js";

/**
 * Node.js application data storage using the file system.
 */
class NodeJSAppDataStorage extends AppDataStorage<true> {
    /**
     * Constructor.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     */
    constructor(path?: string) {
        super(true, path);
    }

    /**
     * @inheritDoc
     */
    protected override doRead(key: string, asBinary: boolean | undefined): string | Uint8Array | undefined {
        let data: string | Uint8Array | undefined;

        try {
            const buffer = fs.readFileSync(key);

            data = asBinary === true ? buffer : buffer.toString();
        } catch {
            data = undefined;
        }

        return data;
    }

    /**
     * @inheritDoc
     */
    protected override doWrite(key: string, data: string | Uint8Array): void {
        const directory = path.dirname(key);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            });
        }

        fs.writeFileSync(key, data);
    }

    /**
     * @inheritDoc
     */
    protected override doDelete(key: string): void {
        fs.rmSync(key, {
            force: true
        });
    }
}

/**
 * Browser application data storage using the browser local storage.
 */
class BrowserAppDataStorage extends AppDataStorage<false> {
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

/**
 * Local storage implementation for the current environment.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- localStorage is not defined in Node.js.
export const LocalAppDataStorage: new (path?: string) => AppDataStorage<boolean> = globalThis.localStorage === undefined ? NodeJSAppDataStorage : BrowserAppDataStorage;
