import {readTestResource} from '@signpdf/internal-utils';
import {extractSignature} from './extractSignature';
import {SignPdfError} from './SignPdfError';

describe(extractSignature, () => {
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
        const signedPdf = readTestResource('signed.pdf');
        const extracted = extractSignature(signedPdf);
        expect(extracted).toMatchSnapshot();
    });

    /**
     * Builds a minimal fake signed PDF: a self-consistent /ByteRange header,
     * a /Contents-style <hex> placeholder holding derBuffer + zero padding,
     * and a trailer.
     */
    const makeFakeSignedPdf = (derBuffer, paddingBytes) => {
        const hex = derBuffer.toString('hex') + '00'.repeat(paddingBytes);
        const placeholder = `<${hex}>`;
        const trailer = 'trailer';
        const pad = (n) => String(n).padStart(10, '0');
        // Fixed-width numbers keep the header length independent of the values.
        const prefix = '%PDF-1.7\n';
        const headerFor = (b1, b2, b3) => `/ByteRange [0 ${pad(b1)} ${pad(b2)} ${pad(b3)}]`;
        const b1 = prefix.length + headerFor(0, 0, 0).length; // offset of '<'
        const b2 = b1 + placeholder.length; // just past '>'
        const header = headerFor(b1, b2, trailer.length);
        return Buffer.from(prefix + header + placeholder + trailer, 'binary');
    };

    it('keeps a genuine trailing 0x00 byte of the signature (#317)', () => {
        // DER SEQUENCE whose real content ends in 0x00:
        // 30 05 (SEQUENCE, len 5) 04 03 aa bb 00 (OCTET STRING, len 3)
        const der = Buffer.from('30050403aabb00', 'hex');
        const extracted = extractSignature(makeFakeSignedPdf(der, 20));
        expect(Buffer.from(extracted.signature, 'binary')).toEqual(der);
    });

    it('trims placeholder padding from a long-form-length DER ending in 0x00', () => {
        // SEQUENCE with long-form length: 30 82 01 06, then 262 content bytes
        // (a 258-byte OCTET STRING incl. its 4-byte header) ending in 0x00.
        const content = Buffer.concat([
            Buffer.from('04820102', 'hex'),
            Buffer.alloc(258, 0xab),
        ]);
        content[content.length - 1] = 0x00;
        const der = Buffer.concat([Buffer.from('30820106', 'hex'), content]);
        const extracted = extractSignature(makeFakeSignedPdf(der, 40));
        expect(Buffer.from(extracted.signature, 'binary')).toEqual(der);
    });

    it('extracts an unpadded signature unchanged', () => {
        const der = Buffer.from('30050403aabbcc', 'hex');
        const extracted = extractSignature(makeFakeSignedPdf(der, 0));
        expect(Buffer.from(extracted.signature, 'binary')).toEqual(der);
    });
});
