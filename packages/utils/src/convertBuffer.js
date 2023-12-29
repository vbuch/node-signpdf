import {SignPdfError} from './SignPdfError';

/**
 * @param {Buffer | Uint8Array | string} input
 * @param {string} name
 * @returns {Buffer}
 */
export function convertBuffer(input, name) {
    if (typeof input === 'string') {
        return Buffer.from(input, 'base64');
    }
    if (input instanceof Buffer || input instanceof Uint8Array) {
        return Buffer.from(input);
    }
    throw new SignPdfError(
        `${name} expected as Buffer, Uint8Array or base64-encoded string.`,
        SignPdfError.TYPE_INPUT,
    );
}
