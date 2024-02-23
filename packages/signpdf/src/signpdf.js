import {
    convertBuffer,
    removeTrailingNewLine,
    findByteRange,
    SignPdfError,
    Signer,
} from '@signpdf/utils';

export {Signer, SignPdfError};

/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */

export class SignPdf {
    constructor() {
        this.lastSignature = null;
    }

    /**
     * @param {Buffer | Uint8Array | string} pdfBuffer
     * @param {Signer} signer
     * @param {Date | undefined} signingTime
     * @returns {Promise<Buffer>}
     */
    async sign(
        pdfBuffer,
        signer,
        signingTime = undefined,
    ) {
        if (!(signer instanceof Signer)) {
            throw new SignPdfError(
                'Signer implementation expected.',
                SignPdfError.TYPE_INPUT,
            );
        }

        let pdf = removeTrailingNewLine(convertBuffer(pdfBuffer, 'PDF'));

        // Find the ByteRange placeholder.
        const {byteRangePlaceholder, byteRangePlaceholderPosition} = findByteRange(pdf);

        if (!byteRangePlaceholder) {
            throw new SignPdfError(
                'No ByteRangeStrings found within PDF buffer.',
                SignPdfError.TYPE_PARSE,
            );
        }

        // Calculate the actual ByteRange that needs to replace the placeholder.
        const byteRangeEnd = byteRangePlaceholderPosition + byteRangePlaceholder.length;
        const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd);
        const placeholderPos = pdf.indexOf('<', contentsTagPos);
        const placeholderEnd = pdf.indexOf('>', placeholderPos);
        const placeholderLengthWithBrackets = (placeholderEnd + 1) - placeholderPos;
        const placeholderLength = placeholderLengthWithBrackets - 2;
        const byteRange = [0, 0, 0, 0];
        byteRange[1] = placeholderPos;
        byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
        byteRange[3] = pdf.length - byteRange[2];
        let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
        actualByteRange += ' '.repeat(byteRangePlaceholder.length - actualByteRange.length);

        // Replace the /ByteRange placeholder with the actual ByteRange
        pdf = Buffer.concat([
            pdf.slice(0, byteRangePlaceholderPosition),
            Buffer.from(actualByteRange),
            pdf.slice(byteRangeEnd),
        ]);

        // Remove the placeholder signature
        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            pdf.slice(byteRange[2], byteRange[2] + byteRange[3]),
        ]);

        const raw = await signer.sign(pdf, signingTime);

        // Check if the PDF has a good enough placeholder to fit the signature.
        // placeholderLength represents the length of the HEXified symbols but we're
        // checking the actual lengths.
        if ((raw.length * 2) > placeholderLength) {
            throw new SignPdfError(
                `Signature exceeds placeholder length: ${raw.length * 2} > ${placeholderLength}`,
                SignPdfError.TYPE_INPUT,
            );
        }

        let signature = Buffer.from(raw, 'binary').toString('hex');
        // Store the HEXified signature. At least useful in tests.
        this.lastSignature = signature;

        // Pad the signature with zeroes so the it is the same length as the placeholder
        signature += Buffer
            .from(String.fromCharCode(0).repeat((placeholderLength / 2) - raw.length))
            .toString('hex');

        // Place it in the document.
        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            Buffer.from(`<${signature}>`),
            pdf.slice(byteRange[1]),
        ]);

        // Magic. Done.
        return pdf;
    }
}

export default new SignPdf();
