/**
 * Create an object with omitted or picked entries.
 *
 * @template Omitting
 * Type representation of `omitting` parameter for return type determination.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 *
 * @param omitting
 * True if omitting.
 *
 * @param o
 * Object.
 *
 * @param keys
 * Keys to omit or pick.
 *
 * @returns
 * Edited object.
 */
function omitOrPick<Omitting extends boolean, T extends object, K extends keyof T>(omitting: Omitting, o: T, ...keys: K[]): Omitting extends true ? Omit<T, K> : Pick<T, K> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Key and value types are known.
    return Object.fromEntries(Object.entries(o).filter(([key]) => keys.includes(key as K) !== omitting)) as ReturnType<typeof omitOrPick<Omitting, T, K>>;
}

/**
 * Create an object with omitted entries.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 *
 * @param o
 * Object.
 *
 * @param keys
 * Keys to omit.
 *
 * @returns
 * Edited object.
 */
export function omit<T extends object, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> {
    return omitOrPick(true, o, ...keys);
}

/**
 * Create an object with picked entries.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 *
 * @param o
 * Object.
 *
 * @param keys
 * Keys to pick.
 *
 * @returns
 * Edited object.
 */
export function pick<T extends object, K extends keyof T>(o: T, ...keys: K[]): Pick<T, K> {
    return omitOrPick(false, o, ...keys);
}

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

/**
 * Create an object as the intersection of two objects.
 *
 * @template T1
 * First object type.
 *
 * @template T2
 * Second object type.
 *
 * @param o1
 * First object.
 *
 * @param o2
 * Second object.
 *
 * @returns
 * Edited object.
 */
export function intersect<T1 extends object, T2 extends object>(o1: T1, o2: Partial<T1> & T2): Pick<T1, keyof T1 & keyof T2> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Key and value types are known.
    return Object.fromEntries(Object.entries(o1).filter(([key]) => key in o2)) as ReturnType<typeof intersect<T1, T2>>;
}

/**
 * Cast a property as a more narrow type.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 *
 * @template TAsType
 * Desired type.
 *
 * @param o
 * Object.
 *
 * @param key
 * Key of property to cast.
 *
 * @returns
 * Single-key object with property cast as desired type.
 */
export function propertyAs<T extends object, K extends keyof T, TAsType extends T[K]>(o: T, key: K): Readonly<Omit<T, K> extends T ? Partial<Record<K, TAsType>> : Record<K, TAsType>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type is determined by condition.
    return (key in o ?
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Force cast.
            [key]: o[key] as TAsType
        } :
        {}
    ) as ReturnType<typeof propertyAs<T, K, TAsType>>;
}

/**
 * Wrapper around {@linkcode Object.values} with additional type declaration to make result a strongly-typed readonly
 * array. Typically used for generating an array of enum-like values. While the type `T` may be inferred, it will do so
 * only as a union of value types and so should be declared explicitly.
 *
 * @param o
 * Object or array.
 *
 * @returns
 * Strongly-typed readonly array of object values.
 */
export function readonlyObjectValues<T>(o: Record<string, T> | ArrayLike<T>): readonly T[] {
    return Object.values(o);
}

/**
 * Type guard to determine if a value is included in a strongly-typed readonly array of values.
 *
 * @param values
 * Values.
 *
 * @param value
 * Value.
 *
 * @returns
 * True if value is included in values, returned as type guard.
 */
export function isValueType<TBase extends string | number, TValue extends TBase>(values: readonly TValue[], value: TBase): value is TValue {
    return (values as readonly TBase[]).includes(value);
}
