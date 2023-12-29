import {pdfkitAddPlaceholder} from '@signpdf/placeholder-pdfkit010';
import {plainAddPlaceholder} from '@signpdf/placeholder-plain';
import {P12Signer} from '@signpdf/signer-p12';
import {
    extractSignature,
    Signer,
    SignPdfError,
} from '@signpdf/utils';
import {readTestResource, createPdfkitDocument} from '@signpdf/internal-utils';
import PDFDocument from 'pdfkit';
import signpdf from './signpdf';

/**
 * Creates a Buffer containing a PDF.
 * Returns a Promise that is resolved with the resulting Buffer of the PDFDocument.
 * @returns {Promise<Buffer>}
 */
const createPdf = (params) => {
    const requestParams = {
        addSignaturePlaceholder: true,
        ...params,
    };

    const {pdf, ended} = createPdfkitDocument(PDFDocument, params);

    if (requestParams.addSignaturePlaceholder) {
        // Externally (to PDFKit) add the signature placeholder.
        const refs = pdfkitAddPlaceholder({
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'I am the author',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
            ...requestParams.placeholder,
        });
        // Externally end the streams of the created objects.
        // PDFKit doesn't know much about them, so it won't .end() them.
        Object.keys(refs).forEach((key) => refs[key].end());
    }

    // Also end the PDFDocument stream.
    // See pdf.on('end'... on how it is then converted to Buffer.
    pdf.end();

    return ended;
};

describe('Test signing', () => {
    it('expects PDF to be Buffer', async () => {
        try {
            await signpdf.sign(['non-buffer'], new P12Signer(Buffer.from('')));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"PDF expected as Buffer, Uint8Array or base64-encoded string."');
        }
    });
    it('expects P12 signer to be Buffer', async () => {
        try {
            await signpdf.sign(Buffer.from(''), 'non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"Signer implementation expected."');
        }

        try {
            await signpdf.sign(Buffer.from(''), {});
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"Signer implementation expected."');
        }
    });
    it('expects PDF to contain a ByteRange placeholder', async () => {
        try {
            await signpdf.sign(Buffer.from('No BR placeholder\n%%EOF'), new Signer());
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"No ByteRangeStrings found within PDF buffer."');
        }
    });
    it('expects a reasonably sized placeholder', async () => {
        try {
            const pdfBuffer = await createPdf({
                placeholder: {
                    signatureLength: 2,
                },
            });
            const p12Signer = new P12Signer(readTestResource('certificate.p12'));

            await signpdf.sign(pdfBuffer, p12Signer);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"Signature exceeds placeholder length: 3224 > 4"');
        }
    });
    it('signs input PDF', async () => {
        let pdfBuffer = await createPdf();
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs a landscape PDF', async () => {
        let pdfBuffer = await createPdf({layout: 'landscape'});
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs detached', async () => {
        let pdfBuffer = await createPdf({text: 'Some text'});

        await signpdf.sign(pdfBuffer, new P12Signer(readTestResource('certificate.p12')));
        const signature1 = signpdf.lastSignature;

        pdfBuffer = await createPdf({text: 'some other text '.repeat(30)});
        await signpdf.sign(pdfBuffer, new P12Signer(readTestResource('certificate.p12')));
        const signature2 = signpdf.lastSignature;

        expect(signature1).not.toBe(signature2);
        expect(signature1).toHaveLength(signature2.length);
    });
    it('signs a ready pdf', async () => {
        let pdfBuffer = readTestResource('w3dummy.pdf');
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            signatureLength: 1612,
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('Signs the resource from issue 158', async () => {
        let pdfBuffer = readTestResource('issue-158-test.pdf');
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            signatureLength: 1612,
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);
        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs a ready pdf that does not have Annots', async () => {
        let pdfBuffer = readTestResource('no-annotations.pdf');
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            signatureLength: 1612,
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs a ready pdf that does not have metadata', async () => {
        let pdfBuffer = readTestResource('no-metadata.pdf');
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            signatureLength: 1612,
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs a ready pdf for the second time', async () => {
        let signedPdfBuffer = readTestResource('signed-once.pdf');
        const p12Signer = new P12Signer(
            readTestResource('withpass.p12'),
            {passphrase: 'node-signpdf'},
        );

        signedPdfBuffer = plainAddPlaceholder({
            pdfBuffer: signedPdfBuffer,
            reason: 'second',
            location: 'test location',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            signatureLength: 1592,
        });
        signedPdfBuffer = await signpdf.sign(signedPdfBuffer, p12Signer);

        const {signature, signedData} = extractSignature(signedPdfBuffer, 2);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs big PDF twice producing big AcroForm ID on the first time', async () => {
        let pdfBuffer = await createPdf({
            pages: 100,
        });
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);

        const secondP12Signer = new P12Signer(
            readTestResource('withpass.p12'),
            {passphrase: 'node-signpdf'},
        );
        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'second',
            location: 'test location',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            signatureLength: 1592,
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, secondP12Signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {
            signature: secondSignature,
            signedData: secondSignatureData,
        } = extractSignature(pdfBuffer, 2);
        expect(typeof secondSignature === 'string').toBe(true);
        expect(secondSignatureData instanceof Buffer).toBe(true);
    });
    it('signs a ready pdf containing a link', async () => {
        let pdfBuffer = readTestResource('including-a-link.pdf');
        const p12Signer = new P12Signer(readTestResource('certificate.p12'));

        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            location: 'some city',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            signatureLength: 1612,
        });
        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs with ca, intermediate and multiple certificates bundle', async () => {
        let pdfBuffer = await createPdf();
        const p12Signer = new P12Signer(readTestResource('bundle.p12'));

        pdfBuffer = await signpdf.sign(pdfBuffer, p12Signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('signs with passphrased certificate', async () => {
        let pdfBuffer = await createPdf();
        const p12signer = new P12Signer(
            readTestResource('withpass.p12'),
            {passphrase: 'node-signpdf'},
        );

        pdfBuffer = await signpdf.sign(pdfBuffer, p12signer);
        expect(pdfBuffer instanceof Buffer).toBe(true);

        const {signature, signedData} = extractSignature(pdfBuffer);
        expect(typeof signature === 'string').toBe(true);
        expect(signedData instanceof Buffer).toBe(true);
    });
    it('error when final key inside trailer dictionary is /Root', async () => {
        let pdfBuffer = readTestResource('w3dummy-different-trailer.pdf');
        pdfBuffer = plainAddPlaceholder({
            pdfBuffer,
            reason: 'I have reviewed it.',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Sofia, Bulgaria',
            signatureLength: 1612,
        });
        const trailer = pdfBuffer
            .slice(pdfBuffer.lastIndexOf('trailer'))
            .toString();
        // the trailer should contain only one startxref
        expect(trailer.match(/startxref/g).length).toBe(1);
    });
    it('expects siging to fail because of no byteRangePlaceholder available to sign', async () => {
        try {
            const pdfBuffer = readTestResource('signed.pdf');
            const p12Signer = new P12Signer(readTestResource('certificate.p12'));

            await signpdf.sign(pdfBuffer, p12Signer);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
        }
    });
});
