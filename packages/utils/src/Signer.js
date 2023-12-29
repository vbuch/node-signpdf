/* eslint-disable no-unused-vars */
import {SignPdfError} from './SignPdfError';

export class Signer {
    /**
     * @param {Buffer} pdfBuffer
     * @param {Date | undefined} signingTime
     * @returns {Promise<Buffer>}
     */
    async sign(pdfBuffer, signingTime = undefined) {
        throw new SignPdfError(
            `sign() is not implemented on ${this.constructor.name}`,
            SignPdfError.TYPE_INPUT,
        );
    }
}
