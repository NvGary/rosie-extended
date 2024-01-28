import { IFactory } from 'rosie';

import { IFactoryEx } from '../types';
import { fillGaps } from '../utils/fillGaps';
import impl from './fill';

jest.mock('../utils/fillGaps', () => {
    const fillGaps = jest.fn();
    return {
        __esModule: true,
        default: fillGaps,
        fillGaps,
    };
});

const mockThisFactory = {
    attr: jest.fn(),
} as Partial<IFactory> as IFactory;

const mockThisFactoryEx = {
    attr: jest.fn(),
} as Partial<IFactoryEx> as IFactoryEx;

const mockFactory = {
    build: jest.fn().mockReturnValue({}),
} as Partial<IFactory> as IFactory;

const mockFactoryEx = {
    build: jest.fn().mockReturnValue({}),
} as Partial<IFactoryEx> as IFactoryEx;

describe('fill', () => {
    describe.each`
        THIS                 | type            | factory          | name
        ${mockThisFactory}   | ${'IFactory'}   | ${mockFactory}   | ${'IFactory'}
        ${mockThisFactory}   | ${'IFactory'}   | ${mockFactoryEx} | ${'IFactoryEx'}
        ${mockThisFactoryEx} | ${'IFactoryEx'} | ${mockFactory}   | ${'IFactory'}
        ${mockThisFactoryEx} | ${'IFactoryEx'} | ${mockFactoryEx} | ${'IFactoryEx'}
    `('working with THIS type $type and factory $name', ({ THIS, factory }) => {
        describe('fill(attr, factory)', () => {
            beforeEach(() => {
                impl.call(THIS, 'name', factory);
            });

            it("maps to rosie attr('name', ['name'], generator", () => {
                expect(THIS.attr).toHaveBeenCalledTimes(1);
                expect(THIS.attr).toHaveBeenCalledWith('name', ['name'], expect.anything());
            });

            it('has generator (props) => factory.build({ ...props })', () => {
                const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                cb({ foo: 'bar' });

                expect(factory.build).toHaveBeenCalledTimes(1);
                expect(factory.build).toHaveBeenCalledWith({ foo: 'bar' }, expect.anything());
            });
        });

        describe('fill(attr, size, factory)', () => {
            beforeEach(() => {
                impl.call(THIS, 'name', 'nameCount', factory);
            });

            it("maps to rosie attr('name', ['name', 'nameCount'], generator", () => {
                expect(THIS.attr).toHaveBeenCalledTimes(1);
                expect(THIS.attr).toHaveBeenCalledWith('name', ['name', 'nameCount'], expect.anything());
            });

            it('has generator (props, size) => factory.build({ ...props })', () => {
                const [[, , cb]] = (THIS.attr as jest.Mock).mock.calls;
                cb([{ foo: 'bar' }], 2);

                expect(fillGaps).toHaveBeenCalledTimes(1);
                expect(fillGaps).toHaveBeenCalledWith([{ foo: 'bar' }], factory, 2, undefined, expect.anything());
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
