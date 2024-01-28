/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFactory } from 'rosie';

import { RosieFactoryOptions, IFactoryEx, TFactory } from '../types';
import fillGaps from '../utils/fillGaps';

export default function <T>(this: IFactory<T>, attr: string, size: string | TFactory, factory?: TFactory): IFactory<T>;
export default function <T, U extends RosieFactoryOptions<T> = RosieFactoryOptions<T>>(this: IFactoryEx<T, U>, attr: string, size: string | TFactory, factory?: TFactory): IFactoryEx<T, U>;
export default function <T, U extends RosieFactoryOptions<T> = RosieFactoryOptions<T>>(this: any, attr: string, size: string | TFactory, factory?: TFactory): TFactory<T, U> {
    switch (arguments.length) {
        case 3: {
            this.attr(attr, [attr, size as string], (props: Array<any> | undefined, size: number) =>
                fillGaps(props, factory!, size, undefined, { ...this.opts })
            );
            break;
        }
        default: {
            factory = size as TFactory;
            this.attr(attr, [attr], (props: Array<any> | undefined) => factory!.build(props, { ...this.opts }));
        }
    }
    return this;
}
