import { faker } from '@faker-js/faker';

import { maybe } from './maybe';

const fakerMockMaybe = jest.spyOn(faker.helpers, 'maybe');

type Customer = {
    name: string;
    age: number;
};

describe('maybe', () => {
    describe.each`
        fakerImpl       | cbInvoked | description
        ${(cb) => cb()} | ${1}      | ${'faker resolves to true'}
        ${undefined}    | ${0}      | ${'faker resolves to false'}
    `('$description', ({ cbInvoked, fakerImpl }) => {
        let cb: jest.Mock;
        beforeEach(() => {
            cb = jest.fn();
            fakerMockMaybe.mockImplementation(fakerImpl);
        });

        it('invokes the provided callback $cbInvoked times', () => {
            maybe<Customer>(cb);

            expect(cb).toHaveBeenCalledTimes(cbInvoked);
        });

        if (cbInvoked) {
            it('returns the return value from the callback', () => {
                cb.mockReturnValue(faker.word.sample());
                const res = maybe(cb);

                expect(res).toBe(cb.mock.results[0].value);
            });
        }

        it('respects parameter (includeMaybe = false)', () => {
            maybe<Customer>(cb, 'name', { includeMaybe: false });

            expect(fakerMockMaybe).not.toHaveBeenCalled();
            expect(cb).not.toHaveBeenCalled();
        });

        it('respects parameter mustHave when (includeMaybe = false)', () => {
            maybe<Customer>(cb, 'name', { includeMaybe: false, mustHave: ['name'] });

            expect(fakerMockMaybe).not.toHaveBeenCalled();
            expect(cb).toHaveBeenCalledTimes(1);
        });

        it('properly checks mustHave for attr name', () => {
            maybe<Customer>(cb, 'name', { includeMaybe: false, mustHave: ['age'] });

            expect(cb).not.toHaveBeenCalled();
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
