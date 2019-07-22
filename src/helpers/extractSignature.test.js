import fs from 'fs';
import extractSignature from './extractSignature';
import SignPdfError from '../SignPdfError';

describe('extractSignature', () => {
    it('expects PDF to be Buffer', () => {
        try {
            extractSignature('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('expects PDF to contain a ByteRange placeholder', () => {
        try {
            extractSignature(Buffer.from('No BR placeholder'));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
        try {
            extractSignature(Buffer.from('Some /ByteRange [ with no end'));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
        try {
            extractSignature(Buffer.from('Some /ByteRange [ inv alid byte range ]'));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('extracts signature', () => {
        const signedPdf = fs.readFileSync(`${__dirname}/../../resources/signed.pdf`);
        const extracted = extractSignature(signedPdf);
        expect(extracted).toMatchSnapshot();
    });
});
