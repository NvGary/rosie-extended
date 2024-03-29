import { BaseFactoryOptions, TFactory } from '../types';

/**
 * Takes an array of partial objects and fills any missing attributes using the provided factory.
 *
 * @template T
 * @template U
 * @param {Array<T>|undefined} data - Array of partial data objects
 * @param {Pick<IFactory<T>, 'build' | 'buildList'>|Pick<IFactoryEx<T, U>, 'build' | 'buildList'>} factory - Factory used to populate any missing data attributes
 * @param {number} size - Optionally construct a new default initialised array of size. Used when data is undefined.
 * @param {Partial<T>=} attributes - Overridden attributes for the factory to directly assign
 * @param {Partial<U>=} options - Options to pass to factory
 * @returns {Array} Array of fully populated data objects
 */
export function fillGaps<T, U extends BaseFactoryOptions<T> = BaseFactoryOptions<T>>(
    data: Array<T> | undefined,
    factory: Pick<TFactory<T, U>, 'build' | 'buildList'>,
    size: number,
    attributes?: { [k in keyof T]?: T[k] },
    options?: { [o in keyof U]?: U[o] },
): Array<T> {
    if (data?.length !== undefined) {
        return data.map((props: T) => factory.build({ ...attributes, ...props }, { ...options }));
    }
    return factory.buildList(size, { ...attributes }, { ...options });
}

export default fillGaps;
