import PDFDocument from 'pdfkit';
import findByteRange from './findByteRange';
import SignPdfError from '../SignPdfError';
import pdfkitAddPlaceholder from './pdfkitAddPlaceholder';

/**
 * Creates a Buffer containing a PDF.
 * Returns a Promise that is resolved with the resulting Buffer of the PDFDocument.
 * @returns {Promise<Buffer>}
 */
const createPdf = (params = {
    placeholder: {},
    text: 'node-signpdf',
}) => new Promise((resolve) => {
    const pdf = new PDFDocument({
        autoFirstPage: true,
        size: 'A4',
        layout: 'portrait',
        bufferPages: true,
    });
    pdf.info.CreationDate = '';

    // Add some content to the page
    pdf
        .fillColor('#333')
        .fontSize(25)
        .moveDown()
        .text(params.text);

    // Collect the ouput PDF
    // and, when done, resolve with it stored in a Buffer
    const pdfChunks = [];
    pdf.on('data', (data) => {
        pdfChunks.push(data);
    });
    pdf.on('end', () => {
        resolve(Buffer.concat(pdfChunks));
    });

    // Externally (to PDFKit) add the signature placeholder.
    const refs = pdfkitAddPlaceholder({
        pdf,
        pdfBuffer: Buffer.from([pdf]),
        reason: 'I am the author',
        ...params.placeholder,
    });
    // Externally end the streams of the created objects.
    // PDFKit doesn't know much about them, so it won't .end() them.
    Object.keys(refs).forEach(key => refs[key].end());

    // Also end the PDFDocument stream.
    // See pdf.on('end'... on how it is then converted to Buffer.
    pdf.end();
});

describe('findByteRange', () => {
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
        try {
            const pdfBuffer = await createPdf({
                placeholder: {
                    signatureLength: 1612,
                },
            });

            const {byteRangeString, byteRange} = findByteRange(pdfBuffer);
            expect(byteRangeString).toBe('/ByteRange [0 /********** /********** /**********]');
            expect(byteRange[0]).toBe('0');
            expect(byteRange[1]).toBe('/**********');
            expect(byteRange[2]).toBe('/**********');
            expect(byteRange[3]).toBe('/**********');
        } catch (e) {
            expect('here').not.toBe('here');
        }
    });
});
