import forge from 'node-forge';

const PKCS12_CERT_BAG = '1.2.840.113549.1.12.10.1.3';
const PKCS12_KEY_BAG = '1.2.840.113549.1.12.10.1.2';
export const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
export const DEFAULT_SIGNATURE_MAX_LENGTH = 8192;

export class signpdf {

    constructor() {
        this.byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER;
        this.signatureMaxLength = DEFAULT_SIGNATURE_MAX_LENGTH;
    }

    sign(pdfBuffer, p12Buffer) {
        if (!(pdfBuffer instanceof Buffer)) {
            throw new Error('PDF expected as Buffer.');
        }
        if (!(p12Buffer instanceof Buffer)) {
            throw new Error('p12 certificate expected as Buffer.');
        }

        let pdf = pdfBuffer;
        const lastChar = pdfBuffer.slice(pdfBuffer.length - 1).toString();
        if (lastChar === '\n') {
            // remove the trailing new line
            pdf = pdf.slice(0, pdf.length - 1);
        }

        const byteRangePlaceholder = [
            0,
            `/${this.byteRangePlaceholder}`,
            `/${this.byteRangePlaceholder}`,
            `/${this.byteRangePlaceholder}`,
        ];
        const byteRangeString = `/ByteRange [${byteRangePlaceholder.join(' ')}]`;
        const byteRangePos = pdf.indexOf(byteRangeString);
        if (byteRangePos === -1) {
            throw new Error(`Could not find ByteRange placeholder: ${byteRangeString}`);
        }
        const byteRangeEnd = byteRangePos + byteRangeString.length;
        const byteRange = [0, 0, 0, 0];
        byteRange[1] = byteRangeEnd + '\n/Contents '.length;
        byteRange[2] = byteRange[1] + (this.signatureMaxLength * 2) + '<>'.length;
        byteRange[3] = pdf.length - byteRange[2];
        let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
        actualByteRange += ' '.repeat(byteRangeString.length - actualByteRange.length);

        // Replace the /ByteRange placeholder with the actual ByteRange
        pdf = Buffer.concat([
            pdf.slice(0, byteRangePos),
            Buffer.from(actualByteRange),
            pdf.slice(byteRangeEnd),
        ]);

        return pdf;
    }
}

export default new signpdf();
