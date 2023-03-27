import { faker } from '@faker-js/faker';

import { maybe } from './maybe';

jest.mock('@faker-js/faker', () => ({
    faker: {
        helpers: {
            maybe: jest.fn(),
        },
    },
}));

const fakerMockMaybe = faker.helpers.maybe as jest.Mock;

describe('maybe', () => {
    describe('faker resolves to true', () => {
        beforeEach(() => {
            fakerMockMaybe.mockImplementation((cb) => cb());
        });

        it('invokes the provided callback', () => {
            const cb = jest.fn();
            maybe(cb);

            expect(cb).toBeCalledTimes(1);
        });

        it('returns the return value from the callback', () => {
            const cb = jest.fn().mockReturnValue('blah');
            const res = maybe(cb);

            expect(res).toBe('blah');
        });

        it('respects parameter (check = true)', () => {
            const cb = jest.fn();
            maybe(cb, true);

            expect(fakerMockMaybe).toBeCalledTimes(1);
        });

        it('respects parameter (check = false)', () => {
            const cb = jest.fn();
            maybe(cb, false);

            expect(fakerMockMaybe).not.toBeCalled();
        });
    });

    describe('faker resolves to false', () => {
        beforeEach(() => {
            fakerMockMaybe.mockReturnValue(undefined);
        });

        it('does not invoke the provided callback', () => {
            const cb = jest.fn();
            maybe(cb);

            expect(cb).not.toBeCalled();
        });

        it('returns undefined', () => {
            const cb = jest.fn().mockReturnValue('blah');
            const res = maybe(cb);

            expect(res).toBeUndefined();
        });

        it('respects parameter (check = true)', () => {
            const cb = jest.fn();
            maybe(cb, true);

            expect(fakerMockMaybe).toBeCalledTimes(1);
        });

        it('respects parameter (check = false)', () => {
            const cb = jest.fn();
            maybe(cb, false);

            expect(fakerMockMaybe).not.toBeCalled();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
