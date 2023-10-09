import PDFDocument from 'pdfkit';
import {readTestResource} from '@signpdf/internal-utils';
import {findByteRange} from './findByteRange';
import {SignPdfError} from './SignPdfError';

describe(findByteRange, () => {
    it('expects PDF to be Buffer', () => {
        try {
            findByteRange('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('expects PDF to have a placeholder', () => {
        try {
            const pdf = new PDFDocument({
                autoFirstPage: true,
                size: 'A4',
                layout: 'portrait',
                bufferPages: true,
            });
            pdf.info.CreationDate = '';

            findByteRange(Buffer.from([pdf]));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
        }
    });
    it('expects to return correct byteRangeString and byteRange', async () => {
        const pdfBuffer = readTestResource('with-placeholder.pdf');

        const {byteRangePlaceholder, byteRanges} = findByteRange(pdfBuffer);

        expect(byteRangePlaceholder).toBe('/ByteRange [0 /********** /********** /**********]');
        expect(byteRanges[0][0]).toBe('0');
        expect(byteRanges[0][1]).toBe('/**********');
        expect(byteRanges[0][2]).toBe('/**********');
        expect(byteRanges[0][3]).toBe('/**********');
    });
    it('expects byteRangePlaceholder to be undefined', async () => {
        const pdfBuffer = readTestResource('signed.pdf');

        const {byteRangePlaceholder} = findByteRange(pdfBuffer);

        expect(byteRangePlaceholder).toBe(undefined);
    });
    it('expects byteRangeStrings to be pre-defined', async () => {
        const pdfBuffer = readTestResource('signed.pdf');

        const {byteRangeStrings} = findByteRange(pdfBuffer);

        expect(byteRangeStrings[0]).toBe('/ByteRange [0 153 3379 1275]');
    });
});
