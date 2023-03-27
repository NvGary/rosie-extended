import { faker } from '@faker-js/faker';
import { IFactory } from 'rosie';

import { IFactoryEx } from '../types';
import { fillGaps } from './fillGaps';

const mockFactory = {
    build: jest.fn().mockReturnValue({}),
    buildList: jest.fn().mockImplementation((size) => new Array(size).fill({})),
} as Partial<IFactory> as IFactory;

const mockFactoryEx = {
    build: jest.fn().mockReturnValue({}),
    buildList: jest.fn().mockImplementation((size) => new Array(size).fill({})),
} as Partial<IFactoryEx> as IFactoryEx;

describe('fillGaps', () => {
    describe.each`
        factory          | name
        ${mockFactory}   | ${'IFactory'}
        ${mockFactoryEx} | ${'IFactoryEx'}
    `('working with $name', ({ factory }) => {
        describe('build a new array', () => {
            const size = faker.datatype.number({ min: 1, max: 5 });

            it('invokes factory.buildList', () => {
                fillGaps(undefined, factory, size);
                expect(factory.buildList).toBeCalledWith(size, {}, {});
            });

            it('has correct size', () => {
                const res = fillGaps(undefined, factory, size);
                expect(res).toHaveLength(size);
            });
        });

        describe('reuse existing array', () => {
            const size = faker.datatype.number({ min: 1, max: 5 });
            const props = new Array(size).fill({});
            const ignored_size_param = 10;

            it('invokes factory.build', () => {
                fillGaps(props, factory, ignored_size_param);
                expect(factory.build).toBeCalledTimes(size);
            });

            it('maintains original size', () => {
                const res = fillGaps(props, factory, ignored_size_param);
                expect(res).toHaveLength(size);
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
