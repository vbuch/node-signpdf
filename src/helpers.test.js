import fs from 'fs';
import PDFDocument from 'pdfkit';
import signer from './signpdf';
import {addSignaturePlaceholder, extractSignature, stringToHex} from './helpers';

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
    const refs = addSignaturePlaceholder({
        pdf,
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
describe('Helpers', () => {
    it('extract signature from signed pdf', async () => {
        const pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../certificate.p12`);

        const signedPdfBuffer = signer.sign(pdfBuffer, p12Buffer);
        const originalSignature = signer.lastSignature;

        const {signature} = extractSignature(signedPdfBuffer);
        expect(stringToHex(signature)).toBe(originalSignature);
    });
});
