import SignPdfError, {
    ERROR_TYPE_UNKNOWN,
    ERROR_TYPE_INPUT,
    ERROR_TYPE_PARSE,
} from './SignPdfError';

describe('SignPdfError', () => {
    it('SignPdfError extends Error', () => {
        const instance = new SignPdfError('Whatever message');
        expect(instance instanceof Error).toBe(true);
    });
    it('type defaults to UNKNOWN', () => {
        const instance = new SignPdfError('Whatever message');
        expect(instance.type).toBe(ERROR_TYPE_UNKNOWN);
    });
    it('type can be specified', () => {
        [
            ERROR_TYPE_UNKNOWN,
            ERROR_TYPE_INPUT,
            ERROR_TYPE_PARSE,
        ].forEach((type) => {
            const instance = new SignPdfError('Whatever message', type);
            expect(instance.type).toBe(type);
        });
    });
});
