/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFactory } from 'rosie';

import { fillGaps, maybe } from '../utils';
import { IFactoryEx, TFactory } from '../types';

export default function <T>(this: IFactory<T>, attr: string, size: string | TFactory, factory?: TFactory): IFactory<T>;
export default function <T, U>(this: IFactoryEx<T, U>, attr: string, size: string | TFactory, factory?: TFactory): IFactoryEx<T, U>;
export default function <T, U>(this: any, attr: string, size: string | TFactory, factory?: TFactory): TFactory<T, U> {
    if (this.opts['includeMaybe'] === undefined) {
        this.option('includeMaybe', true);
    }

    switch (arguments.length) {
        case 3: {
            this.after((obj: Record<string, any>, opts: Record<string, any>) => {
                const count: number = opts[size as string] ?? obj[size as string];

                if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                    if (obj[attr] === undefined) {
                        // respect .build({ attr: undefined })
                    } else {
                        // respect .build({ attr: {} })
                        obj[attr] = fillGaps(obj[attr], factory!, count, undefined, opts);
                    }
                } else {
                    // respect maybe
                    obj[attr] = maybe(() => fillGaps(undefined, factory!, count, undefined, opts), opts['includeMaybe']);
                }
            });
            break;
        }
        default: {
            factory = size as IFactory | IFactoryEx;
            this.after((obj: Record<string, any>, opts: Record<string, any>) => {
                if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                    if (obj[attr] === undefined) {
                        // respect .build({ attr: undefined })
                    } else {
                        // respect .build({ attr: {} })
                        obj[attr] = factory!.build(obj[attr], opts);
                    }
                } else {
                    // respect maybe
                    obj[attr] = maybe(() => factory!.build(undefined, opts), opts['includeMaybe']);
                }
            });
            break;
        }
    }
    return this;
}
