import { Factory } from 'rosie';

import fill from './fill';
import fillMaybe from './fillMaybe';
import { install } from './install';
import maybe from './maybe';

jest.mock('rosie', () => ({
    Factory: {
        prototype: {},
    },
}));

jest.mock('./fill', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('./fillMaybe', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('./maybe', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('install', () => {
    describe('before install', () => {
        it('has no custom Factory prototypes', () => {
            expect(Factory.prototype.fill).toBeUndefined();
            expect(Factory.prototype.fillMaybe).toBeUndefined();
            expect(Factory.prototype.maybe).toBeUndefined();
        });
    });

    describe('after install', () => {
        it('has custom Factory prototypes', () => {
            install(Factory);

            expect(Factory.prototype.fill).toBe(fill);
            expect(Factory.prototype.fillMaybe).toBe(fillMaybe);
            expect(Factory.prototype.maybe).toBe(maybe);
        });

        it('is safe to invoke install() multiple times', () => {
            install(Factory);
            install(Factory);

            expect(Factory.prototype.fill).toBe(fill);
            expect(Factory.prototype.fillMaybe).toBe(fillMaybe);
            expect(Factory.prototype.maybe).toBe(maybe);
        });

        afterEach(() => {
            delete Factory.prototype.fill;
            delete Factory.prototype.fillMaybe;
            delete Factory.prototype.maybe;
        });
    });
});
