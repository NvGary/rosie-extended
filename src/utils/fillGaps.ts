import { RosieFactoryOptions, TFactory } from '../types';

/**
 * Takes an array of partial objects and fills any missing attributes using the provided factory.
 *
 * @template T
 * @template U
 * @param {Array<T>|undefined} data - Array of partial data objects
 * @param {IFactory<T>|IFactoryEx<T, U>} factory - Factory used to populate any missing data attributes
 * @param {number} size - Optionally construct a new default initialised array of size. Used when data is undefined.
 * @param {Partial<T>=} attributes - Overridden attributes for the factory to directly assign
 * @param {Partial<U>=} options - Options to pass to factory
 * @returns {Array} Array of fully populated data objects
 */
export function fillGaps<T, U extends RosieFactoryOptions<T> = RosieFactoryOptions<T>>(
    data: Array<T> | undefined,
    factory: TFactory<T, U>,
    size: number,
    attributes?: { [k in keyof T]?: T[k] },
    options?: { [o in keyof U]?: U[o] }
): Array<T> {
    if (data?.length !== undefined) {
        return data.map((props: T) => factory.build({ ...attributes, ...props }, { ...options }));
    }
    return factory.buildList(size, { ...attributes }, { ...options });
}

export default fillGaps;
