/* eslint-disable no-unused-vars */
import {SignPdfError} from './SignPdfError';

export class Signer {
    /**
     * @param {Buffer} pdfBuffer
     * @returns {Promise<Buffer> | Buffer}
     */
    sign(pdfBuffer) {
        throw new SignPdfError(
            `sign() is not implemented on ${this.constructor.name}`,
            SignPdfError.TYPE_INPUT,
        );
    }
}
