/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFactory } from 'rosie';

import { BaseFactoryOptions, IFactoryEx, TFactory } from '../types';
import { fillGaps, maybe } from '../utils';

export default function <T>(this: IFactory<T>, attr: string, size: string | TFactory, factory?: TFactory): IFactory<T>;
export default function <T, U extends BaseFactoryOptions<T> = BaseFactoryOptions<T>>(
    this: IFactoryEx<T, U>,
    attr: string,
    size: string | TFactory,
    factory?: TFactory,
): IFactoryEx<T, U>;
export default function <T, U extends BaseFactoryOptions<T> = BaseFactoryOptions<T>>(
    this: any,
    attr: string,
    size: string | TFactory,
    factory?: TFactory,
): TFactory<T, U> {
    if (this.opts['includeMaybe'] === undefined) {
        this.option('includeMaybe', true);
    }
    if (this.opts['mustHave'] === undefined) {
        this.option('mustHave', []);
    }

    switch (arguments.length) {
        case 3: {
            this.after((obj: T, opts: U) => {
                const count: number = opts[size as string] ?? obj[size as string];

                if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                    if (obj[attr] === undefined) {
                        // respect .build({ attr: undefined })
                    } else {
                        // respect .build({ attr: {} })
                        obj[attr] = fillGaps(obj[attr], factory!, count, undefined, opts);
                    }
                } else {
                    const cb = () => fillGaps(undefined, factory!, count, undefined, opts);
                    // respect maybe & mustHave
                    obj[attr] = maybe(cb as () => T[keyof T], attr as keyof T, {
                        includeMaybe: opts.includeMaybe,
                        mustHave: opts.mustHave,
                    });
                }
            });
            break;
        }
        default: {
            factory = size as IFactory | IFactoryEx;
            this.after((obj: T, opts: U) => {
                if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                    if (obj[attr] === undefined) {
                        // respect .build({ attr: undefined })
                    } else {
                        // respect .build({ attr: {} })
                        obj[attr] = factory!.build(obj[attr], opts);
                    }
                } else {
                    const cb = () => factory!.build(undefined, opts);
                    // respect maybe & mustHave
                    obj[attr] = maybe(cb as () => T[keyof T], attr as keyof T, {
                        includeMaybe: opts.includeMaybe,
                        mustHave: opts.mustHave,
                    });
                }
            });
            break;
        }
    }
    return this;
}
