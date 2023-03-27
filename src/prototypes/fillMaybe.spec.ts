import { faker } from '@faker-js/faker';
import { IFactory } from 'rosie';

import { IFactoryEx } from '../types';
import { fillGaps } from '../utils/fillGaps';
import { maybe } from '../utils/maybe';
import impl from './fillMaybe';

jest.mock('../utils/fillGaps', () => {
    const fillGaps = jest.fn();
    return {
        __esModule: true,
        default: fillGaps,
        fillGaps,
    };
});

jest.mock('../utils/maybe', () => {
    const maybe = jest.fn();
    return {
        __esModule: true,
        default: maybe,
        maybe,
    };
});

const mockThisFactory = {
    _attrs: {},
    after: jest.fn(),
    option: jest.fn(),
    opts: {},
} as Partial<IFactory> as IFactory;

const mockThisFactoryEx = {
    _attrs: {},
    after: jest.fn(),
    option: jest.fn(),
    opts: {},
} as Partial<IFactoryEx> as IFactoryEx;

const mockFactory = {
    build: jest.fn().mockImplementation((v) => ({ ...v, foo: 'bar' })),
} as Partial<IFactory> as IFactory;

const mockFactoryEx = {
    build: jest.fn().mockImplementation((v) => ({ ...v, foo: 'bar' })),
} as Partial<IFactoryEx> as IFactoryEx;

describe('fillMaybe', () => {
    describe.each`
        THIS                 | type            | factory          | name
        ${mockThisFactory}   | ${'IFactory'}   | ${mockFactory}   | ${'IFactory'}
        ${mockThisFactory}   | ${'IFactory'}   | ${mockFactoryEx} | ${'IFactoryEx'}
        ${mockThisFactoryEx} | ${'IFactoryEx'} | ${mockFactory}   | ${'IFactory'}
        ${mockThisFactoryEx} | ${'IFactoryEx'} | ${mockFactoryEx} | ${'IFactoryEx'}
    `('working with THIS type $type and factory $name', ({ THIS, factory }) => {
        describe('fillMaybe(attr, factory)', () => {
            describe('setup options', () => {
                it('creates includeMaybe option where it does NOT already exist', () => {
                    impl.call(THIS, 'address', factory);

                    expect(THIS.option).toBeCalledTimes(1);
                    expect(THIS.option).toBeCalledWith('includeMaybe', true);
                });

                it('does NOT create includeMaybe option where it DOES already exist', () => {
                    THIS.opts.includeMaybe = true;

                    impl.call(THIS, 'address', factory);

                    expect(THIS.option).not.toBeCalled();
                });
            });

            it('maps to rosie after(callback)', () => {
                impl.call(THIS, 'address', factory);

                expect(THIS.after).toBeCalledTimes(1);
                expect(THIS.after).toBeCalledWith(expect.any(Function));
            });

            describe('callback behaviour', () => {
                const address = {
                    street: faker.address.streetAddress(),
                    city: faker.address.cityName(),
                };
                const opts = {};

                beforeEach(() => {
                    (fillGaps as jest.Mock).mockImplementation((v) => v);
                    (maybe as jest.Mock).mockImplementation((v) => v());
                    impl.call(THIS, 'address', factory);
                });

                it.each`
                    obj                       | result                        | build | maybe | comments
                    ${{ address: undefined }} | ${undefined}                  | ${0}  | ${0}  | ${'respect .build({ attr: undefined })'}
                    ${{ address }}            | ${{ ...address, foo: 'bar' }} | ${1}  | ${0}  | ${'respect .build({ attr: (any value) })'}
                    ${{}}                     | ${{ foo: 'bar' }}             | ${1}  | ${1}  | ${'use provided factory'}
                `('populate obj within .after callback - $comments', ({ obj, build: callsToBuild, maybe: callsToMaybe, result }) => {
                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb(obj, opts);

                    expect(obj).toHaveProperty('address', result);
                    expect(factory.build).toBeCalledTimes(callsToBuild);
                    expect(maybe).toBeCalledTimes(callsToMaybe);
                });

                it.each`
                    includeMaybe | mock                          | build
                    ${true}      | ${(v: () => unknown) => v()}  | ${1}
                    ${false}     | ${(): undefined => undefined} | ${0}
                `('respects maybe = $includeMaybe', ({ includeMaybe, mock, build: callsToBuild }) => {
                    (maybe as jest.Mock).mockImplementationOnce(mock);

                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb({}, { ...opts, includeMaybe });

                    expect(maybe).toBeCalledTimes(1);
                    expect(maybe).toBeCalledWith(expect.any(Function), includeMaybe);
                    expect(factory.build).toBeCalledTimes(callsToBuild);
                });

                it.each`
                    obj            | comments
                    ${{ address }} | ${'(current value)'}
                    ${{}}          | ${'undefined'}
                `('calls factory.build with correct parameters - $comments', ({ obj }) => {
                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb({ ...obj }, opts);

                    expect(factory.build).toBeCalledTimes(1);
                    expect(factory.build).toBeCalledWith(obj.address, opts);
                });
            });
        });

        describe('fillMaybe(attr, size, factory)', () => {
            describe('setup options', () => {
                it('creates includeMaybe option where it does NOT already exist', () => {
                    impl.call(THIS, 'addresses', 'addressCount', factory);

                    expect(THIS.option).toBeCalledTimes(1);
                    expect(THIS.option).toBeCalledWith('includeMaybe', true);
                });

                it('does NOT create includeMaybe option where it DOES already exist', () => {
                    THIS.opts.includeMaybe = true;

                    impl.call(THIS, 'addresses', 'addressCount', factory);

                    expect(THIS.option).not.toBeCalled();
                });
            });

            it('maps to rosie after(callback)', () => {
                impl.call(THIS, 'addresses', 'addressCount', factory);

                expect(THIS.after).toBeCalledTimes(1);
                expect(THIS.after).toBeCalledWith(expect.any(Function));
            });

            describe('callback behaviour', () => {
                const addresses = [
                    {
                        street: faker.address.streetAddress(),
                        city: faker.address.cityName(),
                    },
                ];
                const opts = { addressCount: 1 };

                beforeEach(() => {
                    (fillGaps as jest.Mock).mockImplementation((v = []) => v.map((a: Object) => ({ ...a, foo: 'bar' })));
                    (maybe as jest.Mock).mockImplementation((v) => v());
                    impl.call(THIS, 'addresses', 'addressCount', factory);
                });

                it.each`
                    obj                         | result                               | mock                      | build | maybe | comments
                    ${{ addresses: undefined }} | ${undefined}                         | ${undefined}              | ${0}  | ${0}  | ${'respect .build({ attr: undefined })'}
                    ${{ addresses }}            | ${[{ ...addresses[0], foo: 'bar' }]} | ${undefined}              | ${1}  | ${0}  | ${'respect .build({ attr: (any value) })'}
                    ${{}}                       | ${[{ foo: 'bar' }]}                  | ${() => [{ foo: 'bar' }]} | ${1}  | ${1}  | ${'use fillGaps'}
                `('populate obj within .after callback - $comments', ({ obj, mock, build: callsToBuild, maybe: callsToMaybe, result }) => {
                    if (mock !== undefined) {
                        (fillGaps as jest.Mock).mockImplementation(mock);
                    }

                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb(obj, opts);

                    expect(obj).toHaveProperty('addresses', result);
                    expect(fillGaps).toBeCalledTimes(callsToBuild);
                    expect(maybe).toBeCalledTimes(callsToMaybe);
                });

                it.each`
                    includeMaybe | mock                          | build
                    ${true}      | ${(v: () => unknown) => v()}  | ${1}
                    ${false}     | ${(): undefined => undefined} | ${0}
                `('respects maybe = $includeMaybe', ({ includeMaybe, mock, build: callsToBuild }) => {
                    (maybe as jest.Mock).mockImplementationOnce(mock);

                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb({}, { ...opts, includeMaybe });

                    expect(maybe).toBeCalledTimes(1);
                    expect(maybe).toBeCalledWith(expect.any(Function), includeMaybe);
                    expect(fillGaps).toBeCalledTimes(callsToBuild);
                });

                it.each`
                    obj              | comments
                    ${{ addresses }} | ${'(current value)'}
                    ${{}}            | ${'undefined'}
                `('calls fillGaps with correct parameters - $comments', ({ obj }) => {
                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb({ ...obj }, opts);

                    expect(fillGaps).toBeCalledTimes(1);
                    expect(fillGaps).toBeCalledWith(obj.addresses, factory, expect.anything(), undefined, opts);
                });

                it.each`
                    obj                               | opts                   | resultant
                    ${{ addresses }}                  | ${{ addressCount: 2 }} | ${2}
                    ${{ addresses, addressCount: 3 }} | ${{ addressCount: 2 }} | ${2}
                    ${{ addresses, addressCount: 3 }} | ${{}}                  | ${3}
                    ${{}}                             | ${{ addressCount: 2 }} | ${2}
                    ${{ addressCount: 3 }}            | ${{ addressCount: 2 }} | ${2}
                    ${{ addressCount: 3 }}            | ${{}}                  | ${3}
                `('prefers to pull addressCount from Options', ({ obj, opts, resultant }) => {
                    const [[cb]] = (THIS.after as jest.Mock).mock.calls;
                    cb({ ...obj }, opts);

                    expect(fillGaps).toBeCalledTimes(1);
                    expect(fillGaps).toBeCalledWith(obj.addresses, expect.anything(), resultant, undefined, expect.anything());
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
