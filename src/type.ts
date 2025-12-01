/**
 * Typed function, applicable to any function, stricter than {@link Function}.
 */
export type TypedFunction<TMethod extends (...args: Parameters<TMethod>) => ReturnType<TMethod>> = (...args: Parameters<TMethod>) => ReturnType<TMethod>;

/**
 * Typed synchronous function, applicable to any function that doesn't return a Promise.
 */
export type TypedSyncFunction<TMethod extends TypedFunction<TMethod>> = [ReturnType<TMethod>] extends [PromiseLike<unknown>] ? never : TypedFunction<TMethod>;

/**
 * Determine the fundamental promised type. This is stricter than `Awaited\<Type\>` in that it requires a Promise.
 */
type PromisedType<T> = [T] extends [PromiseLike<infer TPromised>] ? TPromised : never;

/**
 * Typed asynchronous function, applicable to any function that returns a Promise.
 */
export type TypedAsyncFunction<TMethod extends (...args: Parameters<TMethod>) => PromiseLike<PromisedType<ReturnType<TMethod>>>> = (...args: Parameters<TMethod>) => Promise<PromisedType<ReturnType<TMethod>>>;

/**
 * Nullishable type. Extends a type by allowing `null` and `undefined`.
 */
export type Nullishable<T> = T | null | undefined;

/**
 * Non-nullishable type. If T is an object type, it is spread and attributes within it are made non-nullishable.
 * Equivalent to a deep `Required\<T\>` for an object and `NonNullable\<T\>` for any other type.
 */
export type NonNullishable<T> = T extends object ? {
    [P in keyof T]-?: NonNullishable<T[P]>
} : NonNullable<T>;

/**
 * Make some keys within a type optional.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type to restrict property keys to those that are strings and that support a specified type.
 */
export type PropertyKeys<T, TProperty> = {
    [K in keyof T]: K extends string ? T[K] extends TProperty ? K : never : never;
}[keyof T];
