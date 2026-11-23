import { omit, pick } from "./omit-pick.js";

/**
 * Create an object from a wide object without entries matching those from a narrow object.
 *
 * @template TWide
 * Wide object type.
 *
 * @template TNarrow
 * Narrow object type.
 *
 * @template K
 * Narrow object key type, subset of wide object key type.
 *
 * @param wide
 * Wide object.
 *
 * @param narrow
 * Narrow object.
 *
 * @returns
 * Edited object.
 */
export function exclude<TWide extends TNarrow, TNarrow extends object, K extends keyof TNarrow>(wide: TWide, narrow: TNarrow): Omit<TWide, K> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Keys are valid.
    return omit(wide, ...Object.keys(narrow) as K[]);
}

/**
 * Create an object from a wide object with entries matching those from a narrow object.
 *
 * @template TWide
 * Wide object type.
 *
 * @template TNarrow
 * Narrow object type.
 *
 * @template K
 * Narrow object key type, subset of wide object key type.
 *
 * @param wide
 * Wide object.
 *
 * @param narrow
 * Narrow object.
 *
 * @returns
 * Edited object.
 */
export function include<TWide extends TNarrow, TNarrow extends object, K extends keyof TNarrow>(wide: TWide, narrow: TNarrow): Pick<TWide, K> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Keys are valid.
    return pick(wide, ...Object.keys(narrow) as K[]);
}
