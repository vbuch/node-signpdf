import fs from 'fs';
import readRefTable from './readRefTable';
import SignPdfError from '../../SignPdfError';

describe('readRefTable', () => {
    it('Errors when wrong ref table position is given', () => {
        const pdf = fs.readFileSync(`${__dirname}/../../../resources/signed.pdf`);

        try {
            readRefTable(pdf, 1);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
});
