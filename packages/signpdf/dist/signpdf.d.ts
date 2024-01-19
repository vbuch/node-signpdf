/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */
export class SignPdf {
    lastSignature: string;
    /**
     * @param {Buffer | Uint8Array | string} pdfBuffer
     * @param {ISigner} signer
     * @param {Date | undefined} signingTime
     * @returns {Promise<Buffer>}
     */
    sign(pdfBuffer: Buffer | Uint8Array | string, signer: ISigner, signingTime?: Date | undefined): Promise<Buffer>;
}
declare const _default: SignPdf;
export default _default;
export type SignerOptions = {
    passphrase?: string;
    asn1StrictParsing?: boolean;
};
import { ISigner } from '@signpdf/utils';
import { SignPdfError } from '@signpdf/utils';
export { ISigner, SignPdfError };
//# sourceMappingURL=signpdf.d.ts.map