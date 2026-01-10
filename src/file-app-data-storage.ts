import * as fs from "node:fs";
import * as path from "node:path";
import { AppDataStorage } from "./app-data-storage.js";

/**
 * Application data storage using the file system.
 */
export class FileAppDataStorage extends AppDataStorage<true> {
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
