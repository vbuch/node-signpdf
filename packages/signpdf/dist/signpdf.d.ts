/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */
export class SignPdf {
    lastSignature: string;
    /**
     * @param {Buffer} pdfBuffer
     * @param {Signer} signer
     * @param {SignerOptions} additionalOptions
     * @returns {Promise<Buffer>}
     */
    sign(pdfBuffer: Buffer, signer: Signer): Promise<Buffer>;
}
declare const _default: SignPdf;
export default _default;
export type SignerOptions = {
    passphrase?: string;
    asn1StrictParsing?: boolean;
};
import { Signer } from '@signpdf/utils';
import { SignPdfError } from '@signpdf/utils';
export { Signer, SignPdfError };
//# sourceMappingURL=signpdf.d.ts.map