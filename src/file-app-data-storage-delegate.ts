import * as fs from "node:fs";
import * as path from "node:path";
import { AppDataStorageDelegate } from "./app-data-storage.js";

/**
 * Application data storage delegate using the file system.
 */
export class FileAppDataStorageDelegate extends AppDataStorageDelegate {
    /**
     * Constructor.
     */
    constructor() {
        super(true);
    }

    /**
     * @inheritDoc
     */
    override async doRead(key: string, asBinary: boolean | undefined): Promise<string | Uint8Array | undefined> {
        return fs.promises.readFile(key).then(buffer =>
            asBinary === true ? buffer : buffer.toString()
        ).catch(() =>
            undefined
        );
    }

    /**
     * @inheritDoc
     */
    override async doWrite(key: string, data: string | Uint8Array): Promise<void> {
        return fs.promises.mkdir(path.dirname(key), {
            recursive: true
        }).then(async () =>
            fs.promises.writeFile(key, data)
        );
    }

    /**
     * @inheritDoc
     */
    override async doDelete(key: string): Promise<void> {
        return fs.promises.rm(key, {
            force: true
        });
    }
}
