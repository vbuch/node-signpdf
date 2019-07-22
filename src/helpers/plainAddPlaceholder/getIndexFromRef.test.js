import getIndexFromRef from './getIndexFromRef';
import SignPdfError from '../../SignPdfError';

describe('getIndexFromRef', () => {
    it('Errors when ref is not found', () => {
        const refTable = {
            offsets: new Map(),
        };
        const ref = '50 0 R';

        try {
            getIndexFromRef(refTable, ref);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
});
