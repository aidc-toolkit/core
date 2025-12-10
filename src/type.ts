/**
 * Typed function, applicable to any function, stricter than {@linkcode Function}.
 *
 * @template TFunction
 * Function type.
 */
export type TypedFunction<TFunction extends (...args: Parameters<TFunction>) => ReturnType<TFunction>> = (...args: Parameters<TFunction>) => ReturnType<TFunction>;

/**
 * Typed synchronous function, applicable to any function that doesn't return a {@linkcode Promise}.
 *
 * @template TFunction
 * Function type.
 */
export type TypedSyncFunction<TFunction extends TypedFunction<TFunction>> = [ReturnType<TFunction>] extends [PromiseLike<unknown>] ? never : TypedFunction<TFunction>;

/**
 * Typed constructor. A typed constructor doesn't have to be an exact match to a constructor; the only requirements are
 * that `TConstructorParameters` have compatible types (exact or wider types of the actual constructor parameters) and
 * that `TConstructorInstance` be a compatible type (exact or narrower type of the actual constructor instance).
 *
 * @template TConstructorParameters
 * Constructor parameters types.
 *
 * @template TConstructorInstance
 * Constructor instance type.
 */
export type TypedConstructor<
    TConstructorParameters extends unknown[],
    TConstructorInstance
> = abstract new (...args: TConstructorParameters) => TConstructorInstance;

/**
 * Determine the fundamental promised type. This is stricter than `Awaited<Type>` in that it requires a {@linkcode
 * Promise}.
 *
 * @template T
 * Promised type.
 */
export type PromisedType<T> = [T] extends [PromiseLike<infer TPromised>] ? TPromised : never;

/**
 * Typed asynchronous function, applicable to any function that returns a {@linkcode Promise}.
 *
 * @template TFunction
 * Function type.
 */
export type TypedAsyncFunction<TMethod extends (...args: Parameters<TMethod>) => PromiseLike<PromisedType<ReturnType<TMethod>>>> = (...args: Parameters<TMethod>) => Promise<PromisedType<ReturnType<TMethod>>>;

/**
 * Nullishable type. Extends a type by allowing `null` and `undefined`.
 *
 * @template T
 * Type.
 */
export type Nullishable<T> = T | null | undefined;

/**
 * Non-nullishable type. If T is an object type, it is spread and attributes within it are made non-nullishable.
 * Equivalent to a deep `Required<T>` for an object and `NonNullable<T>` for any other type.
 *
 * @template T
 * Type.
 */
export type NonNullishable<T> = T extends object ? {
    [P in keyof T]-?: NonNullishable<T[P]>
} : NonNullable<T>;

/**
 * Make some keys within a type optional.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type to restrict property keys to those that are strings and that support a specified type.
 *
 * @template T
 * Object type.
 *
 * @template P
 * Object property type.
 */
export type PropertyKeys<T, P> = {
    [K in keyof T]: K extends string ? T[K] extends P ? K : never : never;
}[keyof T];
