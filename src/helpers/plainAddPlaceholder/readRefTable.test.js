import fs from 'fs';
import SignPdfError from '../../SignPdfError';
import readRefTable, {getXref} from './readRefTable';

describe('getXref', () => {
    it('Throws an error when xref is not found at position', () => {
        const pdf = Buffer.from('Not containing an X R E F.');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Throws an error when xref is not at its expected position', () => {
        const pdf = Buffer.from('Contains xref but definetely not where expected.');
        const position = 2;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Throws an error when size is not found', () => {
        const pdf = Buffer.from('xref\n and there is no Size %%EOF');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Throws an error when size has unexpected value', () => {
        const pdf = Buffer.from('xref\n and then somewhere here there is a /Size XXXX %%EOF');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Throws an error when next EOF is not found', () => {
        const pdf = Buffer.from('xref\n then /Size 123 and then but no EOF');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
});

describe('readRefTable', () => {
    it('Expects to merge correctly the refTable of resources', () => {
        [
            'signed-once.pdf',
            'signed-twice.pdf',
            'contributing.pdf',
            'formexample.pdf',
            'incrementally_signed.pdf',
            'signed.pdf',
            'w3dummy.pdf',
        ].forEach((fileName) => {
            const pdf = fs.readFileSync(`${__dirname}/../../../resources/${fileName}`);
            const r = readRefTable(pdf);
            expect(r).toMatchSnapshot();
        });
    });
});
