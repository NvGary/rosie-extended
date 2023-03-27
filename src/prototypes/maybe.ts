/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFactory } from 'rosie';
import { IFactoryEx, TFactory } from '../types';
import { maybe } from '../utils';

export default function <T>(this: IFactory<T>, attr: string, dependencies: string[] | any, value?: any): IFactory<T>;
export default function <T, U>(this: IFactoryEx<T, U>, attr: string, dependencies: string[] | any, value?: any): IFactoryEx<T, U>;
export default function <T, U>(this: any, attr: string, dependencies: string[] | any, value?: any): TFactory<T, U> {
    if (this.opts['includeMaybe'] === undefined) {
        this.option('includeMaybe', true);
    }

    switch (arguments.length) {
        case 2: {
            if (typeof dependencies === 'function') {
                this.attr(attr, ['includeMaybe'], (include: boolean) => maybe(() => dependencies(), include));
            } else {
                this.attr(attr, ['includeMaybe'], (include: boolean) => maybe(() => dependencies, include));
            }
            break;
        }
        default: {
            const deps = new Set<string>(['includeMaybe', ...dependencies]);

            // remove self-reference to respect .build({ attr: undefined }) & .build({ attr: (any value) })
            deps.delete(attr);

            this.attr(attr, Array.from(deps), (include: boolean, ...args: any[]) => maybe(() => value(...args), include));
        }
    }
    return this;
}
