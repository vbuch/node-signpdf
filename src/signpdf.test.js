import PDFDocument from 'pdfkit';
import fs from 'fs';
// import forge from 'node-forge';
import signer from './signpdf';
import {addSignaturePlaceholder, extractSignature} from './helpers';
import SignPdfError from './SignPdfError';

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

describe('Test signpdf', () => {
    it('expects PDF to be Buffer', () => {
        try {
            signer.sign('non-buffer', Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('expects P12 certificate to be Buffer', () => {
        try {
            signer.sign(Buffer.from(''), 'non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('expects PDF to contain a ByteRange placeholder', () => {
        try {
            signer.sign(Buffer.from('No BR placeholder'), Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
        }
    });
    it('expects a reasonably sized placeholder', async () => {
        try {
            const pdfBuffer = await createPdf({
                placeholder: {
                    signatureLength: 2,
                },
            });
            const p12Buffer = fs.readFileSync(`${__dirname}/../certificate.p12`);

            signer.sign(pdfBuffer, p12Buffer);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('signs input PDF', async () => {
        let pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../certificate.p12`);

        pdfBuffer = signer.sign(pdfBuffer, p12Buffer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);

        // const p12Asn1 = forge.asn1.fromDer(signature, {strict: false});
        // console.log(JSON.stringify(p12Asn1, null, 4));
        // const d = forge.pki.certificateFromAsn1(p12Asn1);
        // console.log(d);
    });
    it('signs detached', async () => {
        const p12Buffer = fs.readFileSync(`${__dirname}/../certificate.p12`);

        let pdfBuffer = await createPdf({text: 'Some text'});
        signer.sign(pdfBuffer, p12Buffer);
        const signature1 = signer.lastSignature;

        pdfBuffer = await createPdf({text: 'some other text '.repeat(30)});
        signer.sign(pdfBuffer, p12Buffer);
        const signature2 = signer.lastSignature;

        expect(signature1).not.toBe(signature2);
        expect(signature1).toHaveLength(signature2.length);
    });
    it('signs with passphrased certificate', async () => {
        let pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../withpass.p12`);

        pdfBuffer = signer.sign(
            pdfBuffer,
            p12Buffer,
            {passphrase: 'node-signpdf'},
        );
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('errors on wrong certificate passphrase', async () => {
        const pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../withpass.p12`);

        try {
            signer.sign(
                pdfBuffer,
                p12Buffer,
                {passphrase: 'Wrong passphrase'},
            );
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof Error).toBe(true);
            const error = e.message.toLowerCase();
            expect(error.indexOf('invalid')).not.toBe(-1);
            expect(error.indexOf('password')).not.toBe(-1);
        }
    });
});
