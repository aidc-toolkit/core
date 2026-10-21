import { AppDataStorageDelegate } from "./app-data-storage.js";

/**
 * Application data storage delegate with no-op implementation.
 */
export class NoOpAppDataStorageDelegate extends AppDataStorageDelegate {
    /**
     * Constructor.
     */
    constructor() {
        super(true);
    }

    /**
     * @inheritDoc
     */
    override doRead(): undefined {
        return undefined;
    }

    /**
     * @inheritDoc
     */
    override doWrite(): void {
    }

    /**
     * @inheritDoc
     */
    override doDelete(): void {
    }
}
