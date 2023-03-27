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
        `('2 parameter setup where value = $value', ({ value, description }) => {
            describe('setup options', () => {
                it('creates includeMaybe option where it does NOT already exist', () => {
                    impl.call(THIS, 'name', value);

                    expect(THIS.option).toBeCalledTimes(1);
                    expect(THIS.option).toBeCalledWith('includeMaybe', true);
                });

                it('does NOT create includeMaybe option where it DOES already exist', () => {
                    THIS.opts.includeMaybe = true;

                    impl.call(THIS, 'name', value);

                    expect(THIS.option).not.toBeCalled();
                });
            });

            describe(`maybe(attr, ${value})`, () => {
                beforeEach(() => {
                    impl.call(THIS, 'name', value);
                });

                it("maps to rosie attr('name', ['includeMaybe'], generator)", () => {
                    expect(THIS.attr).toBeCalledTimes(1);
                    expect(THIS.attr).toBeCalledWith('name', ['includeMaybe'], expect.any(Function));
                });

                describe(`generator (includeMaybe) => maybe(() => ${value}, includeMaybe)`, () => {
                    beforeEach(() => {
                        (maybe as jest.Mock).mockImplementation((v) => v());
                    });

                    it.each([[true], [false]])('passes includeMaybe = $includeMaybe to helper', (includeMaybe) => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(includeMaybe);

                        expect(maybe).toBeCalledTimes(1);
                        expect(maybe).toBeCalledWith(expect.any(Function), includeMaybe);
                    });

                    it('returns generator result', () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        const res = cb();

                        expect(res).toBe('blah');
                    });
                });
            });
        });

        describe('3 parameter setup, maybe(attr, dependencies, fn)', () => {
            const fn = jest.fn().mockImplementation(() => 'blah');

            describe('setup options', () => {
                it('creates includeMaybe option where it does NOT already exist', () => {
                    impl.call(THIS, 'name', ['a', 'b', 'c'], fn);

                    expect(THIS.option).toBeCalledTimes(1);
                    expect(THIS.option).toBeCalledWith('includeMaybe', true);
                });

                it('does NOT create includeMaybe option where it DOES already exist', () => {
                    THIS.opts.includeMaybe = true;

                    impl.call(THIS, 'name', ['a', 'b', 'c'], fn);

                    expect(THIS.option).not.toBeCalled();
                });
            });

            describe.each`
                dependencies                         | comments
                ${['age', 'gender']}                 | ${'no self dependency'}
                ${['name', 'age', 'gender']}         | ${'self dependency'}
                ${['age', 'includeMaybe', 'gender']} | ${'attempt to reference includeMaybe'}
            `('dependencies - $comments', ({ dependencies }) => {
                beforeEach(() => {
                    impl.call(THIS, 'name', dependencies, fn);
                });

                it("maps to rosie attr('name', ['includeMaybe', 'age', 'gender'], generator)", () => {
                    expect(THIS.attr).toBeCalledTimes(1);
                    expect(THIS.attr).toBeCalledWith('name', ['includeMaybe', 'age', 'gender'], expect.any(Function));
                });

                describe(`generator (includeMaybe, age, gender) => maybe(() => fn(age, gender), includeMaybe)`, () => {
                    beforeEach(() => {
                        (maybe as jest.Mock).mockImplementation((v) => v());
                    });

                    it.each([[true], [false]])('passes includeMaybe = $includeMaybe to helper', (includeMaybe) => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(includeMaybe);

                        expect(maybe).toBeCalledTimes(1);
                        expect(maybe).toBeCalledWith(expect.any(Function), includeMaybe);
                    });

                    it('passes dependencies to fn', () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        cb(true, 10, 'male');

                        expect(fn).toBeCalledTimes(1);
                        expect(fn).toBeCalledWith(10, 'male'); // ['age', 'gender']
                    });

                    it('returns generator result', () => {
                        const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                        const res = cb();

                        expect(res).toBe('blah');
                    });
                });
            });
        });

        afterEach(() => {
            THIS.opts = {};
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
