import { faker } from '@faker-js/faker';

/**
 * @template T - The type of result of the given callback
 * @callback maybeCallback
 * @returns {T} Result of the callback
 */

/**
 * Returns the result of the callback if the probability check was successful, otherwise `undefined`.
 *
 * @template T - The type of result of the given callback
 * @param {maybeCallback} callback - The callback to be invoked if the probability check was successful
 * @param {boolean=} check - Run the probability check
 * @returns {T} Result of the callback, or undefined if callback was not invoked
 */
export function maybe<T>(callback: () => T | undefined, check: boolean | undefined = true): T | undefined {
    return check ? faker.helpers.maybe(callback) : undefined;
}

export default maybe;
