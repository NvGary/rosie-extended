import { faker } from '@faker-js/faker';
import { IFactory } from 'rosie';

import { IFactoryEx } from '../types';
import { maybe } from '../utils/maybe';

import impl from './maybe';

jest.mock('../utils/maybe', () => {
    const maybe = jest.fn();
    return {
        __esModule: true,
        default: maybe,
        maybe,
        mustHave: jest.fn(),
    };
});

const mockThisFactory = {
    after: jest.fn(),
    attr: jest.fn(),
    option: jest.fn(),
    opts: {},
} as Partial<IFactory> as IFactory;

const mockThisFactoryEx = {
    after: jest.fn(),
    attr: jest.fn(),
    option: jest.fn(),
    opts: {},
} as Partial<IFactoryEx> as IFactoryEx;

describe('maybe', () => {
    describe.each`
        THIS                 | type
        ${mockThisFactory}   | ${'IFactory'}
        ${mockThisFactoryEx} | ${'IFactoryEx'}
    `('working with THIS type $type', ({ THIS }) => {
        describe.each`
            value           | description
            ${'blah'}       | ${'(constant)'}
            ${() => 'blah'} | ${'(function)'}
        `('2 parameter setup where value = $description', ({ value }) => {
            describe.each`
                optionKey         | optionDefaultValue
                ${'includeMaybe'} | ${true}
                ${'mustHave'}     | ${[]}
            `('setup option $optionKey', ({ optionKey, optionDefaultValue }) => {
                it('creates $optionKey option where it does NOT already exist', () => {
                    impl.call(THIS, 'name', value);

                    expect(THIS.option).toHaveBeenCalledWith(optionKey, optionDefaultValue);
                });

                it('does NOT create $optionKey option where it DOES already exist', () => {
                    THIS.opts[optionKey] = optionDefaultValue;

                    impl.call(THIS, 'name', value);

                    expect(THIS.option).not.toHaveBeenCalledWith(optionKey, expect.anything());
                });
            });

            describe(`maybe(attr, ${value})`, () => {
                beforeEach(() => {
                    impl.call(THIS, 'name', value);
                });

                it("maps to rosie attr('name', ['includeMaybe', 'mustHave'], generator)", () => {
                    expect(THIS.attr).toHaveBeenCalledTimes(1);
                    expect(THIS.attr).toHaveBeenCalledWith('name', ['includeMaybe', 'mustHave'], expect.any(Function));
                });

                describe.each`
                    utilityFn | includeMaybe | maybeMock     | mustHaveAttrs | description
                    ${maybe}  | ${true}      | ${(v) => v()} | ${[]}         | ${'generator (includeMaybe) => maybe(...)'}
                    ${maybe}  | ${false}     | ${(v) => v()} | ${[]}         | ${'generator (includeMaybe) => maybe(...)'}
                    ${maybe}  | ${undefined} | ${(v) => v()} | ${[]}         | ${'generator (includeMaybe) => maybe(...)'}
                `('$description', ({ includeMaybe, maybeMock, utilityFn }) => {
                    beforeEach(() => {
                        (maybe as jest.Mock).mockImplementation(maybeMock);
                    });

                    it(`passes includeMaybe = ${includeMaybe} to helper`, () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(includeMaybe);

                        expect(utilityFn).toHaveBeenCalledTimes(1);
                        expect(utilityFn).toHaveBeenCalledWith(
                            expect.any(Function),
                            expect.any(String),
                            expect.any(Object),
                        );

                        const [[, , options]] = jest.mocked(maybe).mock.calls;
                        expect(options).toHaveProperty('includeMaybe', includeMaybe);
                    });

                    it(`returns generator result (includeMaybe = ${includeMaybe})`, () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        const res = cb(includeMaybe);

                        expect(res).toBe('blah');
                    });
                });
            });
        });

        describe('3 parameter setup, maybe(attr, dependencies, generator)', () => {
            let generator: jest.MockedFunction<typeof faker.word.noun>;
            beforeEach(() => {
                generator = jest.fn(faker.word.noun);
            });

            describe.each`
                optionKey         | optionDefaultValue
                ${'includeMaybe'} | ${true}
                ${'mustHave'}     | ${[]}
            `('setup option $optionKey', ({ optionKey, optionDefaultValue }) => {
                it('creates $optionKey option where it does NOT already exist', () => {
                    impl.call(THIS, 'name', ['a', 'b', 'c'], generator);

                    expect(THIS.option).toHaveBeenCalledWith(optionKey, optionDefaultValue);
                });

                it('does NOT create $optionKey option where it DOES already exist', () => {
                    THIS.opts[optionKey] = optionDefaultValue;

                    impl.call(THIS, 'name', ['a', 'b', 'c'], generator);

                    expect(THIS.option).not.toHaveBeenCalledWith(optionKey, expect.anything());
                });
            });

            describe.each`
                dependencies                         | comments
                ${['age', 'gender']}                 | ${'no self dependency'}
                ${['name', 'age', 'gender']}         | ${'self dependency'}
                ${['age', 'includeMaybe', 'gender']} | ${'attempt to reference includeMaybe'}
                ${['age', 'mustHave', 'gender']}     | ${'attempt to reference mustHave'}
            `('dependencies - $comments', ({ dependencies }) => {
                beforeEach(() => {
                    impl.call(THIS, 'name', dependencies, generator);
                });

                it("maps to rosie attr('name', ['includeMaybe', 'mustHave', 'age', 'gender'], generator)", () => {
                    expect(THIS.attr).toHaveBeenCalledTimes(1);
                    expect(THIS.attr).toHaveBeenCalledWith(
                        'name',
                        ['includeMaybe', 'mustHave', 'age', 'gender'],
                        expect.any(Function),
                    );
                });

                describe(`generator (includeMaybe, mustHave = [], age, gender) => maybe(() => generator(age, gender), () => includeMaybe)`, () => {
                    beforeEach(() => {
                        (maybe as jest.Mock).mockImplementation((v) => v());
                    });

                    it.each([[true], [false]])('passes includeMaybe = $includeMaybe to helper', (includeMaybe) => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(includeMaybe, []);

                        expect(maybe).toHaveBeenCalledTimes(1);
                        expect(maybe).toHaveBeenCalledWith(
                            expect.any(Function),
                            expect.any(String),
                            expect.any(Object),
                        );

                        const [[, , options]] = jest.mocked(maybe).mock.calls;
                        expect(options).toHaveProperty('includeMaybe', includeMaybe);
                    });

                    it('passes dependencies to generator', () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(true, [], 10, 'male');

                        expect(generator).toHaveBeenCalledTimes(1);
                        expect(generator).toHaveBeenCalledWith(10, 'male'); // ['age', 'gender']
                    });

                    it('returns generator result', () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        const res = cb();

                        expect(res).toBe(generator.mock.results[0].value);
                    });
                });
            });
        });

        afterEach(() => {
            THIS.opts = {};
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
