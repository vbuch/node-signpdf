/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */
export class P12Signer extends Signer {
    /**
     * @param {Buffer} p12Buffer
     * @param {SignerOptions} additionalOptions
     */
    constructor(p12Buffer: Buffer, additionalOptions?: SignerOptions);
    options: {
        passphrase: string;
        asn1StrictParsing: boolean;
    };
    cert: any;
    /**
     * @param {Buffer} pdfBuffer
     * @returns {Buffer}
     */
    sign(pdfBuffer: Buffer): Buffer;
}
export type SignerOptions = {
    passphrase?: string;
    asn1StrictParsing?: boolean;
};
import { Signer } from '@signpdf/utils';
//# sourceMappingURL=P12Signer.d.ts.map