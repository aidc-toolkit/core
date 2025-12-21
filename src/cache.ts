import type { Promisable } from "./type.js";

/**
 * Generic cache. Typically used to manage a local copy of remote data that is not refreshed regularly.
 *
 * @template TCache
 * Type of cached data.
 *
 * @template TSource
 * Type of source data. The type may be different from the cached data type if a transformation is required.
 */
export interface Cache<TCache, TSource = TCache> {
    /**
     * Get the date/time at or after which the source should be checked for updates.
     *
     * @returns
     * Next check date/time or undefined if this is the first usage.
     */
    getNextCheckDateTime: () => Promisable<Date | undefined>;

    /**
     * Set the date/time at or after which the source should be checked for updates.
     *
     * @param nextCheckDateTime
     * Next check date/time.
     */
    setNextCheckDateTime: (nextCheckDateTime: Date) => Promisable<void>;

    /**
     * Get the date/time at which the cache was last updated. This may more accurately reflect the date/time at which
     * the last source retrieved was updated.
     *
     * @returns
     * Date/time at which the cache was last updated or undefined if this is the first usage.
     */
    getCacheDateTime: () => Promisable<Date | undefined>;

    /**
     * Set the date/time at which the cache was last updated.
     *
     * @param cacheDateTime
     * Date/time at which the cache was last updated.
     */
    setCacheDateTime: (cacheDateTime: Date) => Promisable<void>;

    /**
     * Get the cached data.
     *
     * @returns
     * Cached data or undefined if this is the first usage.
     */
    getCacheData: () => Promisable<TCache | undefined>;

    /**
     * Set the cached data.
     *
     * @param cacheData
     * Cached data.
     */
    setCacheData: (cacheData: TCache) => Promisable<void>;

    /**
     * Get the date/time at which the source was last updated. This method should not be called unless the next check
     * date/time has passed, as it may trigger an expensive remote retrieval.
     */
    getSourceDateTime: () => Promisable<Date>;

    /**
     * Source data. This method should not be called unless the next check date/time has passed, as it may trigger an
     * expensive remote retrieval.
     */
    getSourceData: () => Promisable<TSource>;
}
