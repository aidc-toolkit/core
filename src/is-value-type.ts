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
