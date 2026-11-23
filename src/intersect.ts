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
