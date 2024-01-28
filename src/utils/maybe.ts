import { faker } from '@faker-js/faker';
import { MaybeFactoryOptions } from '../types';

/**
 * @template T - The type of result of the given callback
 * @callback callback
 * @returns {NonNullable<T>} Result of the callback
 */

/**
 * Returns the result of the callback if the probability check was successful, otherwise `undefined`.
 *
 * @template T - The type of result of the given callback
 * @typeparam K name of attribute
 * @param {callback} callback - The callback to be invoked if the probability check was successful
 * @param {K=} name the attribute name
 * @param {MaybeFactoryOptions=} options - Options controlling function behaviour
 * @returns {NonNullable<T>} Result of the callback, or undefined if callback was not invoked
 */
export function maybe<T>(callback: () => NonNullable<T>): NonNullable<T> | undefined;
export function maybe<T = Record<string, any>, K extends keyof T = keyof T>(callback: () => T[K], name: K, options: MaybeFactoryOptions<T>): T[K] | undefined;
export function maybe<T = any>(callback: () => any, name?: keyof T, options?: MaybeFactoryOptions<T>): any {
    const {includeMaybe = true, mustHave = []} = options ?? {};

    if (name && mustHave.includes(name))
        return callback();
    else
        return includeMaybe ? faker.helpers.maybe(callback) : undefined;
}

export default maybe;
