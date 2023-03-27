import { Factory } from 'rosie';

import fill from './fill';
import fillMaybe from './fillMaybe';
import maybe from './maybe';

export function install() {
    if (Factory.prototype.fill === undefined) {
        Factory.prototype.fill = fill;
    }

    if (Factory.prototype.fillMaybe === undefined) {
        Factory.prototype.fillMaybe = fillMaybe;
    }

    if (Factory.prototype.maybe === undefined) {
        Factory.prototype.maybe = maybe;
    }
}
