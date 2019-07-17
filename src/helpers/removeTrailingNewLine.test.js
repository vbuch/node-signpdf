import removeTrailingNewLine from './removeTrailingNewLine';
import SignPdfError from '../SignPdfError';

describe('removeTrailingNewLine', () => {
    it('expects PDF to be Buffer', () => {
        try {
            removeTrailingNewLine('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('returns source if there is no trailing new line', () => {
        const source = Buffer.from('something with no new line\n%%EOF');
        const result = removeTrailingNewLine(source);
        expect(result).toEqual(source);
    });
    it('removes a trailing new line', () => {
        const source = Buffer.from('something with a new line\n%%EOF\n');
        const result = removeTrailingNewLine(source);
        expect(result.toString()).toEqual('something with a new line\n%%EOF');
    });
});
