import crypto from 'crypto';
import forge from 'node-forge';
import SignPdfError from './SignPdfError';
import {extractSignature, stringToHex} from './helpers';

export {default as SignPdfError} from './SignPdfError';

const PKCS12_CERT_BAG = '1.2.840.113549.1.12.10.1.3';
const PKCS12_KEY_BAG = '1.2.840.113549.1.12.10.1.2';
export const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';

export class SignPdf {
    constructor() {
        this.byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER;
        this.lastSignature = null;
    }

    sign(
        pdfBuffer,
        p12Buffer,
        additionalOptions = {},
    ) {
        const options = {
            asn1StrictParsing: false,
            passphrase: '',
            ...additionalOptions,
        };

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
        const p12 = forge.pkcs12.pkcs12FromAsn1(
            p12Asn1,
            options.asn1StrictParsing,
            options.passphrase,
        );
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
        if (raw.length > placeholderLength) {
            throw new SignPdfError(
                `Signature exceeds placeholder length: ${raw.length} > ${placeholderLength}`,
                SignPdfError.TYPE_INPUT,
            );
        }

        let signature = stringToHex(raw);
        this.lastSignature = signature;

        // placeholderLength is for the HEX symbols and we need the raw char length
        const placeholderCharCount = placeholderLength / 2;

        // Pad with zeroes so the output signature is the same length as the placeholder
        signature += Buffer
            .from(String.fromCharCode(0).repeat(placeholderCharCount - raw.length))
            .toString('hex');

        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            Buffer.from(`<${signature}>`),
            pdf.slice(byteRange[1]),
        ]);

        return pdf;
    }
    // eslint-disable-next-line class-methods-use-this
    verify(pdfBuffer) {
        if (!(pdfBuffer instanceof Buffer)) {
            throw new SignPdfError(
                'PDF expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }
        // credits: https://stackoverflow.com/questions/15969733/verify-pkcs7-pem-signature-unpack-data-in-node-js/16148331#16148331
        const {signature, signedData} = extractSignature(pdfBuffer);
        const p7Asn1 = forge.asn1.fromDer(signature);
        const message = forge.pkcs7.messageFromAsn1(p7Asn1);
        const sig = message.rawCapture.signature;
        const attrs = message.rawCapture.authenticatedAttributes;
        const set = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, attrs);
        const buf = Buffer.from(forge.asn1.toDer(set).data, 'binary');
        const cert = forge.pki.certificateToPem(message.certificates[0]);
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(buf);
        const validAuthenticatedAttributes = verifier.verify(cert, sig, 'binary');
        if (!validAuthenticatedAttributes) {
            return ({
                verified: false,
                message: 'Wrong authenticated attributes',
            });
        }
        const {oids} = forge.pki;
        const fullAttrDigest = attrs
            .find(attr => forge.asn1.derToOid(attr.value[0].value) === oids.messageDigest);
        const attrDigest = fullAttrDigest.value[1].value[0].value;
        const dataDigest = crypto.createHash('SHA256').update(signedData).digest();
        const validContentDigest = dataDigest.toString('binary') === attrDigest;
        if (!validContentDigest) {
            return ({
                verified: false,
                message: 'Wrong content digest',
            });
        }
        return ({verified: true});
    }
}

export default new SignPdf();
