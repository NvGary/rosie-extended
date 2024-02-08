import { Factory } from 'rosie';

import fill from './fill';
import fillMaybe from './fillMaybe';
import maybe from './maybe';

/**
 * Takes an array of partial objects and fills any missing attributes using the provided factory.
 *
 * @param {typeof Factory} factory - Rosie factory type to extend
 */
export function install(factory: typeof Factory): void {
    if (factory.prototype.fill === undefined) {
        factory.prototype.fill = fill;
    }

    if (factory.prototype.fillMaybe === undefined) {
        factory.prototype.fillMaybe = fillMaybe;
    }

    if (factory.prototype.maybe === undefined) {
        factory.prototype.maybe = maybe;
    }
}
