/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFactory } from 'rosie';
import { BaseFactoryOptions, IFactoryEx, TFactory } from '../types';
import { maybe } from '../utils';

export default function <T>(this: IFactory<T>, attr: string, dependencies: string[] | any, value?: any): IFactory<T>;
export default function <T, U extends BaseFactoryOptions<T> = BaseFactoryOptions<T>>(this: IFactoryEx<T, U>, attr: string, dependencies: string[] | any, value?: any): IFactoryEx<T, U>;
export default function <T, U extends BaseFactoryOptions<T> = BaseFactoryOptions<T>>(this: any, attr: string, dependencies: string[] | any, value?: any): TFactory<T, U> {
    if (this.opts['includeMaybe'] === undefined) {
        this.option('includeMaybe', true);
    }
    if (this.opts['mustHave'] === undefined) {
        this.option('mustHave', []);
    }

    switch (arguments.length) {
        case 2: {
            if (typeof dependencies === 'function') {
                this.attr(attr, ['includeMaybe', 'mustHave'], (includeMaybe: boolean, mustHave: [string]) => maybe(() => dependencies(), attr, { includeMaybe, mustHave }));
            } else {
                this.attr(attr, ['includeMaybe', 'mustHave'], (includeMaybe: boolean, mustHave: [string]) => maybe(() => dependencies, attr, { includeMaybe, mustHave }));
            }
            break;
        }
        default: {
            const deps = new Set<string>(['includeMaybe', 'mustHave', ...dependencies]);

            // remove self-reference to respect .build({ attr: undefined }) & .build({ attr: (any value) })
            deps.delete(attr);

            this.attr(attr, Array.from(deps), (includeMaybe: boolean, mustHave: [string], ...args: any[]) => {
                return maybe(() => value(...args), attr, { includeMaybe, mustHave });
            });
        }
    }
    return this;
}
