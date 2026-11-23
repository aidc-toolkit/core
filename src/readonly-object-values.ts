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
