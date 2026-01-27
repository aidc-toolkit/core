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
export abstract class Cache<TCache, TSource = TCache> {
    /**
     * Get the date/time at or after which the source should be checked for updates. If the value is undefined, this is
     * the first usage.
     */
    abstract get nextCheckDateTime(): Promisable<Date | undefined>;

    /**
     * Get the date/time at which the cache was last updated. This may more accurately reflect the date/time at which
     * the last source retrieved was updated. If the value is undefined, there is no data in the cache.
     */
    abstract get cacheDateTime(): Promisable<Date | undefined>;

    /**
     * Get the cache data. This should only ever be called if the cache date/time is defined.
     */
    abstract get cacheData(): Promisable<TCache>;

    /**
     * Get the date/time at which the source was last updated. This should not be called unless the next check date/time
     * has passed, as it may trigger an expensive remote retrieval.
     */
    abstract get sourceDateTime(): Promisable<Date>;

    /**
     * Get the source data. This should not be called unless the next check date/time has passed, as it may trigger an
     * expensive remote retrieval.
     */
    abstract get sourceData(): Promisable<TSource>;

    /**
     * Update the cache with only the next check date/time. The cache date/time and cache data must not be modified.
     * This is typically called when the cache is up to date with the source or source retrieval has failed.
     *
     * @param nextCheckDateTime
     * Next check date/time.
     */
    abstract update(nextCheckDateTime: Date): Promisable<void>;

    /**
     * Update all cache parameters. This is typically called when the cache is updated from the source.
     *
     * @param nextCheckDateTime
     * Next check date/time.
     *
     * @param cacheDateTime
     * Cache date/time.
     *
     * @param cacheData
     * Cache data.
     */
    abstract update(nextCheckDateTime: Date, cacheDateTime: Date, cacheData: TCache): Promisable<void>;
}
