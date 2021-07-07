import * as helpers from './index';

describe('Signers index', () => {
    it('Exports expected signers', () => {
        expect(Object.keys(helpers)).toMatchSnapshot();
    });
});
