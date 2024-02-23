/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */
export class P12Signer extends Signer {
    /**
     * @param {Buffer | Uint8Array | string} p12Buffer
     * @param {SignerOptions} additionalOptions
     */
    constructor(p12Buffer: Buffer | Uint8Array | string, additionalOptions?: SignerOptions);
    options: {
        passphrase: string;
        asn1StrictParsing: boolean;
    };
    cert: any;
}
export type SignerOptions = {
    passphrase?: string;
    asn1StrictParsing?: boolean;
};
import { Signer } from '@signpdf/utils';
//# sourceMappingURL=P12Signer.d.ts.map