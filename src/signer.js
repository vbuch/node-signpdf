import SignPdfError from './SignPdfError';

export default class Signer {
    sign() {
        throw new SignPdfError(
            `sign not implemented on ${this.constructor.name}`,
            SignPdfError.TYPE_INPUT,
        );
    }
}
