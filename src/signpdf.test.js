import PDFDocument from 'pdfkit';
import forge from 'node-forge';
import fs from 'fs';
import signer from './signpdf';
import {pdfkitAddPlaceholder, extractSignature, plainAddPlaceholder} from './helpers';
import SignPdfError from './SignPdfError';

/**
 * Creates a Buffer containing a PDF.
 * Returns a Promise that is resolved with the resulting Buffer of the PDFDocument.
 * @returns {Promise<Buffer>}
 */
const createPdf = params => new Promise((resolve) => {
    const requestParams = {
        placeholder: {},
        text: 'node-signpdf',
        addSignaturePlaceholder: true,
        ...params,
    };

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
        .text(requestParams.text);

    // Collect the ouput PDF
    // and, when done, resolve with it stored in a Buffer
    const pdfChunks = [];
    pdf.on('data', (data) => {
        pdfChunks.push(data);
    });
    pdf.on('end', () => {
        resolve(Buffer.concat(pdfChunks));
    });

    if (requestParams.addSignaturePlaceholder) {
        // Externally (to PDFKit) add the signature placeholder.
        const refs = pdfkitAddPlaceholder({
            pdf,
            reason: 'I am the author',
            ...requestParams.placeholder,
        });
        // Externally end the streams of the created objects.
        // PDFKit doesn't know much about them, so it won't .end() them.
        Object.keys(refs).forEach(key => refs[key].end());
    }

    // Also end the PDFDocument stream.
    // See pdf.on('end'... on how it is then converted to Buffer.
    pdf.end();
});

describe('Test signing', () => {
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
            const p12Buffer = fs.readFileSync(`${__dirname}/../resources/certificate.p12`);

            signer.sign(pdfBuffer, p12Buffer);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('signs input PDF', async () => {
        let pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/certificate.p12`);

        pdfBuffer = signer.sign(pdfBuffer, p12Buffer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs detached', async () => {
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/certificate.p12`);

        let pdfBuffer = await createPdf({text: 'Some text'});
        signer.sign(pdfBuffer, p12Buffer);
        const signature1 = signer.lastSignature;

        pdfBuffer = await createPdf({text: 'some other text '.repeat(30)});
        signer.sign(pdfBuffer, p12Buffer);
        const signature2 = signer.lastSignature;

        expect(signature1).not.toBe(signature2);
        expect(signature1).toHaveLength(signature2.length);
    });
    it('signs a ready pdf', async () => {
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/certificate.p12`);
        let pdfBuffer = fs.readFileSync(`${__dirname}/../resources/w3dummy.pdf`);
        pdfBuffer = plainAddPlaceholder(
            pdfBuffer,
            {reason: 'I have reviewed it.'},
        );
        pdfBuffer = signer.sign(pdfBuffer, p12Buffer);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs a ready pdf twice', async () => {
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/vizics.p12`);
        let pdfBuffer = fs.readFileSync(`${__dirname}/../resources/testa.pdf`);
        pdfBuffer = plainAddPlaceholder(
            pdfBuffer,
            {reason: '1'},
        );
        pdfBuffer = signer.sign(pdfBuffer, p12Buffer, {passphrase: 'oekrew'});
        fs.writeFileSync(`${__dirname}/../resources/test-1.pdf`, pdfBuffer);

        const secondP12Buffer = fs.readFileSync(`${__dirname}/../resources/vizics.p12`);
        let signedPdfBuffer = fs.readFileSync(`${__dirname}/../resources/test-1.pdf`);
        signedPdfBuffer = plainAddPlaceholder(
            signedPdfBuffer,
            {reason: 'second one'},
        );
        signedPdfBuffer = signer.sign(signedPdfBuffer, secondP12Buffer, { passphrase:'oekrew'});
        fs.writeFileSync(`${__dirname}/../resources/test-2.pdf`, signedPdfBuffer);

        const thirdP12Buffer = fs.readFileSync(`${__dirname}/../resources/withpass.p12`);
        let signedTwicePdfBuffer = fs.readFileSync(`${__dirname}/../resources/test-2.pdf`);
        signedTwicePdfBuffer = plainAddPlaceholder(
            signedTwicePdfBuffer,
            {reason: 'third one'},
        );
        signedTwicePdfBuffer = signer.sign(signedTwicePdfBuffer, thirdP12Buffer, {passphrase: 'node-signpdf'});
        fs.writeFileSync(`${__dirname}/../resources/test-3.pdf`, signedTwicePdfBuffer);

        expect(false).toBe(true);
    });
    it('signs with ca, intermediate and multiple certificates bundle', async () => {
        let pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/bundle.p12`);

        pdfBuffer = signer.sign(pdfBuffer, p12Buffer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs with passphrased certificate', async () => {
        let pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/withpass.p12`);

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
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/withpass.p12`);

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
    it('errors when no matching certificate is found in bags', async () => {
        const pdfBuffer = await createPdf();
        const p12Buffer = fs.readFileSync(`${__dirname}/../resources/bundle.p12`);

        // Monkey-patch pkcs12 to return no matching certificates although bundle.p12 is correct.
        const originalPkcs12FromAsn1 = forge.pkcs12.pkcs12FromAsn1;
        let p12Instance;
        forge.pkcs12.pkcs12FromAsn1 = (...params) => {
            // This instance will be used for all non-mocked code.
            p12Instance = originalPkcs12FromAsn1(...params);

            return {
                ...p12Instance,
                getBags: ({bagType}) => {
                    if (bagType === forge.pki.oids.certBag) {
                        // Only mock this case.
                        // Make sure there will be no matching certificate.
                        return {
                            [forge.pki.oids.certBag]: [],
                        };
                    }
                    return p12Instance.getBags({bagType});
                },
            };
        };

        try {
            signer.sign(
                pdfBuffer,
                p12Buffer,
            );
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            const error = e.message.toLowerCase();
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(error.indexOf('matches')).not.toBe(-1);
        } finally {
            forge.pkcs12.pkcs12FromAsn1 = originalPkcs12FromAsn1;
        }
    });
});
