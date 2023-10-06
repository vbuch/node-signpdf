/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */
export class SignPdf {
    byteRangePlaceholder: "**********";
    lastSignature: string;
    /**
     * @param {Buffer} pdfBuffer
     * @param {Buffer} p12Buffer
     * @param {SignerOptions} additionalOptions
     * @returns {Buffer}
     */
    sign(pdfBuffer: Buffer, p12Buffer: Buffer, additionalOptions?: SignerOptions): Buffer;
}
declare const _default: SignPdf;
export default _default;
export type SignerOptions = {
    passphrase?: string;
    asn1StrictParsing?: boolean;
};
//# sourceMappingURL=signpdf.d.ts.map