import { install } from './prototypes/install';
import './index';

jest.mock('./prototypes/install', () => ({
    install: jest.fn(),
}));

describe('entry point', () => {
    describe('side effects', () => {
        it('auto performs install', () => {
            expect(install).toBeCalledTimes(1);
        });
    });
});
