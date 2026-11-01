import { type AppData, decodeAppData, encodeAppData } from "./app-data.js";
import type { Promisable } from "./type.js";

/**
 * Generic read-only application data storage delegate.
 */
export abstract class ReadOnlyAppDataStorageDelegate {
    /**
     * True if binary data is natively supported.
     */
    readonly #supportsBinary: boolean;

    /**
     * Constructor.
     *
     * @param supportsBinary
     * True if binary data is natively supported.
     */
    protected constructor(supportsBinary: boolean) {
        this.#supportsBinary = supportsBinary;
    }

    /**
     * Determine if binary data is natively supported.
     */
    get supportsBinary(): boolean {
        return this.#supportsBinary;
    }

    /**
     * Read a string or binary data from persistent storage.
     *
     * @param key
     * Storage key qualified by path.
     *
     * @param asBinary
     * True if binary data is requested, false or undefined if string data is requested. Ignored if binary data is not
     * supported.
     *
     * @returns
     * String or binary data or undefined if not found.
     */
    abstract doRead(key: string, asBinary: boolean | undefined): Promisable<string | Uint8Array | undefined>;
}

/**
 * Generic read-only application data storage.
 */
export abstract class ReadOnlyAppDataStorage<TDelegate extends ReadOnlyAppDataStorageDelegate> {
    /**
     * Extension to identify binary data.
     */
    protected static readonly BINARY_EXTENSION = ".bin";

    /**
     * Extension to identify JSON data.
     */
    protected static readonly JSON_EXTENSION = ".json";

    /**
     * Delegate.
     */
    readonly #delegate: TDelegate;

    /**
     * Storage path prepended to each key.
     */
    readonly #path: string;

    /**
     * Constructor.
     *
     * @param delegate
     * Delegate.
     *
     * @param path
     * Storage path prepended to each key along with '/' if defined, empty string if not.
     */
    protected constructor(delegate: TDelegate, path?: string) {
        this.#delegate = delegate;
        this.#path = path !== undefined ? `${path}/` : "";
    }

    /**
     * Get the delegate.
     */
    get delegate(): TDelegate {
        return this.#delegate;
    }

    /**
     * Determine if binary data is supported.
     */
    get supportsBinary(): boolean {
        return this.delegate.supportsBinary;
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
        const data = await this.delegate.doRead(this.fullKey(pathKey, asBinary === true), asBinary);

        return typeof data === "string" ? decodeAppData(data) : data;
    }
}

/**
 * Generic read/write application data storage delegate.
 */
export abstract class AppDataStorageDelegate extends ReadOnlyAppDataStorageDelegate {
    /**
     * Write a string or binary data to persistent storage.
     *
     * @param key
     * Storage key qualified by path.
     *
     * @param data
     * String or binary data.
     */
    abstract doWrite(key: string, data: string | Uint8Array): Promisable<void>;

    /**
     * Delete from persistent storage.
     *
     * @param key
     * Storage key qualified by path.
     */
    abstract doDelete(key: string): Promisable<void>;
}

/**
 * Generic read/write application data storage.
 */
export abstract class AppDataStorage<TDelegate extends AppDataStorageDelegate = AppDataStorageDelegate> extends ReadOnlyAppDataStorage<TDelegate> {
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

        await this.delegate.doWrite(this.fullKey(pathKey, isBinary), this.supportsBinary && isBinary ? appData : encodeAppData(appData));
    }

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
        await this.delegate.doDelete(this.fullKey(pathKey, asBinary === true));
    }
}
