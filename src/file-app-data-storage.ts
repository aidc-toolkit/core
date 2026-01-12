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
    protected override async doRead(key: string, asBinary: boolean | undefined): Promise<string | Uint8Array | undefined> {
        return fs.promises.readFile(key).then(buffer =>
            asBinary === true ? buffer : buffer.toString()
        ).catch(() =>
            undefined
        );
    }

    /**
     * @inheritDoc
     */
    protected override async doWrite(key: string, data: string | Uint8Array): Promise<void> {
        return fs.promises.mkdir(path.dirname(key), {
            recursive: true
        }).then(async () =>
            fs.promises.writeFile(key, data)
        );
    }

    /**
     * @inheritDoc
     */
    protected override async doDelete(key: string): Promise<void> {
        return fs.promises.rm(key, {
            force: true
        });
    }
}
