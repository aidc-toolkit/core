/**
 * Promisable type. Extends a type by allowing a {@linkcode Promise} of the same type. Typically used in abstract method
 * declarations where the implementing class may or may not implement the method as asynchronous.
 */
export type Promisable<T> =
    T | Promise<T>;

/**
 * Determine the fundamental promised type. This is stricter than `Awaited<Type>` in that it requires a {@linkcode
 * PromiseLike}.
 *
 * @template T
 * Promised type.
 */
export type Promised<T> =
    [T] extends [PromiseLike<infer TPromised>] ? TPromised : never;

/**
 * Typed function, stricter than {@linkcode Function}. Given any function type, the resulting type is equal to the
 * function type, with strict parameter type and return type matching.
 *
 * @template TFunction
 * Function type.
 */
export type TypedFunction<TFunction extends (...args: Parameters<TFunction>) => ReturnType<TFunction>> =
    (...args: Parameters<TFunction>) => ReturnType<TFunction>;

/**
 * Typed synchronous function. Given any synchronous function type (one that doesn't return a {@linkcode PromiseLike}),
 * the resulting type is equal to the function type, with strict parameter type and return type matching.
 *
 * @template TFunction
 * Function type.
 */
export type TypedSyncFunction<TFunction extends TypedFunction<TFunction>> =
    [ReturnType<TFunction>] extends [PromiseLike<unknown>] ? never : TypedFunction<TFunction>;

/**
 * Typed asynchronous function. Given any asynchronous function type (one that returns a {@linkcode PromiseLike}), the
 * resulting type is equal to the function type, with strict parameter type and return type matching.
 *
 * @template TFunction
 * Function type.
 */
export type TypedAsyncFunction<TFunction extends (...args: Parameters<TFunction>) => PromiseLike<Promised<ReturnType<TFunction>>>> =
    (...args: Parameters<TFunction>) => Promise<Promised<ReturnType<TFunction>>>;

/**
 * Arbitrary constructor. An arbitrary constructor doesn't have to be an exact match to a constructor; the only
 * requirements are that `TConstructorParameters` have compatible types (exact or wider types of the actual constructor
 * parameters) and that `TConstructorInstance` be a compatible type (exact or narrower type of the actual constructor
 * instance).
 *
 * @template TConstructorParameters
 * Constructor parameters types.
 *
 * @template TConstructorInstance
 * Constructor instance type.
 */
export type Constructor<TConstructorParameters extends unknown[], TConstructorInstance> =
    new (...args: TConstructorParameters) => TConstructorInstance;

/**
 * Arbitrary abstract constructor. Abstract version of {@linkcode Constructor}.
 *
 * @template TConstructorParameters
 * Constructor parameters types.
 *
 * @template TConstructorInstance
 * Constructor instance type.
 */
export type AbstractConstructor<TConstructorParameters extends unknown[], TConstructorInstance> =
    abstract new (...args: TConstructorParameters) => TConstructorInstance;

/**
 * Typed constructor. Given any constructor type, optionally abstract, the resulting type is equal to the constructor
 * type, with strict parameter type and return type matching, and not abstract.
 *
 * @template TConstructor
 * Constructor type.
 */
export type TypedConstructor<TConstructor extends abstract new (...args: ConstructorParameters<TConstructor>) => InstanceType<TConstructor>> =
    Constructor<ConstructorParameters<TConstructor>, InstanceType<TConstructor>>;

/**
 * Typed abstract constructor. Given any constructor type, optionally abstract, the resulting type is equal to the
 * constructor type, with strict parameter type and return type matching, and abstract.
 *
 * @template TConstructor
 * Constructor type.
 */
export type TypedAbstractConstructor<TConstructor extends abstract new (...args: ConstructorParameters<TConstructor>) => InstanceType<TConstructor>> =
    AbstractConstructor<ConstructorParameters<TConstructor>, InstanceType<TConstructor>>;

/**
 * Make some keys within a type optional.
 *
 * @template T
 * Object type.
 *
 * @template K
 * Object key type.
 */
export type Optional<T, K extends keyof T> =
    Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Pick the set of properties whose keys are strings.
 *
 * @template T
 * Object type.
 *
 * @template P
 * Object property type.
 */
export type PickStringKey<T> = {
    [K in keyof T]: K extends string ? K : never;
}[keyof T];

/**
 * Pick the set of properties whose types are compatible with a specified type.
 *
 * @template T
 * Object type.
 *
 * @template TProperty
 * Object property type.
 */
export type PickPropertyType<T, TProperty> = {
    [K in keyof T]: T[K] extends TProperty ? K : never;
}[keyof T];

/**
 * Pick the set of properties whose keys are strings and whose types are compatible with a specified type.
 *
 * @template T
 * Object type.
 *
 * @template TProperty
 * Object property type.
 */
export type PickStringKeyPropertyType<T, TProperty> = {
    [K in keyof T]: K extends string ? T[K] extends TProperty ? K : never : never;
}[keyof T];
