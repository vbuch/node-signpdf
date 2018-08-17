import forge from 'node-forge';
import SignPdfError from './SignPdfError';

export {default as SignPdfError} from './SignPdfError';

const PKCS12_CERT_BAG = '1.2.840.113549.1.12.10.1.3';
const PKCS12_KEY_BAG = '1.2.840.113549.1.12.10.1.2';
export const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
export const DEFAULT_SIGNATURE_MAX_LENGTH = 8192;

function pad2(num) {
    const s = `0${num}`;
    return s.substr(s.length - 2);
}

function stringToHex(s) {
    let a = '';
    for (let i = 0; i < s.length; i += 1) {
        a += pad2(s.charCodeAt(i).toString(16));
    }
    return a;
}

export class SignPdf {
    constructor() {
        this.byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER;
        this.signatureMaxLength = DEFAULT_SIGNATURE_MAX_LENGTH;
    }

    sign(pdfBuffer, p12Buffer) {
        if (!(pdfBuffer instanceof Buffer)) {
            throw new SignPdfError(
                'PDF expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }
        if (!(p12Buffer instanceof Buffer)) {
            throw new SignPdfError(
                'p12 certificate expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
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
            throw new SignPdfError(
                `Could not find ByteRange placeholder: ${byteRangeString}`,
                SignPdfError.TYPE_PARSE,
            );
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

        // Remove the placeholder signature
        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            pdf.slice(byteRange[2], byteRange[2] + byteRange[3]),
        ]);

        const forgeCert = forge.util.createBuffer(p12Buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(forgeCert);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, '');
        // get bags by type
        const certBags = p12.getBags({bagType: PKCS12_CERT_BAG})[PKCS12_CERT_BAG];
        const keyBags = p12.getBags({bagType: PKCS12_KEY_BAG})[PKCS12_KEY_BAG];

        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(pdf.toString('binary'));
        let last = certBags[0];
        Object.keys(certBags).forEach((i) => {
            p7.addCertificate(certBags[i].cert);
            last = certBags[i];
        });

        p7.addSigner({
            key: keyBags[0].key,
            certificate: last.cert,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data,
                }, {
                    type: forge.pki.oids.messageDigest,
                    // value will be auto-populated at signing time
                }, {
                    type: forge.pki.oids.signingTime,
                    // value can also be auto-populated at signing time
                    value: new Date(),
                },
            ],
        });
        p7.sign({detached: true});

        const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();

        let signature = stringToHex(raw);
        signature += Buffer
            .from(String.fromCharCode(0).repeat(this.signatureMaxLength - raw.length))
            .toString('hex');

        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            Buffer.from(`<${signature}>`),
            pdf.slice(byteRange[1]),
        ]);

        return pdf;
    }
}

export default new SignPdf();
