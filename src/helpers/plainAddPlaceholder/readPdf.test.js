import fs from 'fs';
import readPdf from './readPdf';
import SignPdfError from '../../SignPdfError';

describe('readPdf', () => {
    it('Errors when an incrementally updated PDF is passed in', () => {
        const pdf = fs.readFileSync(`${__dirname}/../../../resources/incrementally_signed.pdf`);

        try {
            readPdf(pdf);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Errors when a PDF that already contains forms is passed in', () => {
        const pdf = fs.readFileSync(`${__dirname}/../../../resources/formexample.pdf`);

        try {
            readPdf(pdf);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
});
