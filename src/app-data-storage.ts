import { type AppData, decodeAppData, encodeAppData } from "./app-data.js";
import type { Promisable } from "./type.js";

/**
 * Generic read-only application data storage.
 */
export abstract class ReadOnlyAppDataStorage<SupportsBinary extends boolean> {
    /**
     * Extension to identify binary data.
     */
    protected static readonly BINARY_EXTENSION = ".bin";

    /**
     * Extension to identify JSON data.
     */
    protected static readonly JSON_EXTENSION = ".json";

    /**
     * True if binary data is supported natively.
     */
    readonly #supportsBinary: SupportsBinary;

    /**
     * Storage path prepended to each key.
     */
    readonly #path: string;

    /**
     * Constructor.
     *
     * @param supportsBinary
     * True if binary data is supported.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     */
    protected constructor(supportsBinary: SupportsBinary, path?: string) {
        this.#supportsBinary = supportsBinary;
        this.#path = path !== undefined ? `${path}/` : "";
    }

    /**
     * Determine if binary data is supported.
     */
    get supportsBinary(): SupportsBinary {
        return this.#supportsBinary;
    }

    /**
     * Get the storage path, prepended to each key.
     */
    get path(): string {
        return this.#path;
    }

    /**
     * Build the full storage key.
     *
     * @param pathKey
     * Key relative to path.
     *
     * @param isBinary
     * True if key is to binary data, false or undefined if to string data. Ignored if binary data is not supported.
     *
     * @returns
     * Full storage key.
     */
    protected fullKey(pathKey: string, isBinary: boolean): string {
        const keyNoExtension = `${this.path}${pathKey}`;

        // Add extension to key if binary data is supported.
        return this.supportsBinary ?
            `${keyNoExtension}${isBinary ? ReadOnlyAppDataStorage.BINARY_EXTENSION : ReadOnlyAppDataStorage.JSON_EXTENSION}` :
            keyNoExtension;
    }

    /**
     * Read a string or binary data from persistent storage.
     *
     * @param key
     * Storage key (file path in Node.js, key in localStorage).
     *
     * @param asBinary
     * True if binary data is requested, false or undefined if string data is requested. Ignored if binary data is not
     * supported.
     *
     * @returns
     * String or binary data or undefined if not found.
     */
    protected abstract doRead(key: string, asBinary: boolean | undefined): Promisable<(SupportsBinary extends true ? string | Uint8Array : string) | undefined>;

    /**
     * Read application data from storage.
     *
     * @param pathKey
     * Key relative to path.
     *
     * @param asBinary
     * True if binary data is requested, false or undefined if string data is requested. Ignored if binary data is not
     * supported.
     *
     * @returns
     * Application data or undefined if not found.
     */
    async read(pathKey: string, asBinary?: boolean): Promise<AppData | undefined> {
        const data = await this.doRead(this.fullKey(pathKey, asBinary === true), asBinary);

        return typeof data === "string" ? decodeAppData(data) : data;
    }
}

/**
 * Generic read/write application data storage.
 */
export abstract class AppDataStorage<SupportsBinary extends boolean> extends ReadOnlyAppDataStorage<SupportsBinary> {
    /**
     * Write a string or binary data in persistent storage.
     *
     * @param key
     * Storage key (file path in Node.js, key in localStorage).
     *
     * @param data
     * String or binary data.
     */
    protected abstract doWrite(key: string, data: SupportsBinary extends true ? string | Uint8Array : string): Promisable<void>;

    /**
     * Write application data to storage.
     *
     * @param pathKey
     * Key relative to path.
     *
     * @param appData
     * Application data to write.
     */
    async write(pathKey: string, appData: AppData): Promise<void> {
        const isBinary = appData instanceof Uint8Array;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type is determined by supports binary flag.
        await this.doWrite(this.fullKey(pathKey, isBinary), (this.supportsBinary && isBinary ?
            appData :
            encodeAppData(appData)
        ) as Parameters<typeof this.doWrite>[1]);
    }

    /**
     * Delete from persistent storage.
     *
     * @param key
     * Storage key (file path in Node.js, key in localStorage).
     */
    protected abstract doDelete(key: string): Promisable<void>;

    /**
     * Delete application data from persistent storage.
     *
     * @param pathKey
     * Key relative to path.
     *
     * @param asBinary
     * True if key is to binary data, false or undefined if to string data. Ignored if binary data is not supported.
     */
    async delete(pathKey: string, asBinary?: boolean): Promise<void> {
        await this.doDelete(this.fullKey(pathKey, asBinary === true));
    }
}
