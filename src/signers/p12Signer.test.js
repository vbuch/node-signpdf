import SignPdfError from '../SignPdfError';
import P12Signer from './p12Signer';

describe('Test signing', () => {
    it('expects P12 certificate to be Buffer', () => {
        try {
            // eslint-disable-next-line no-new
            new P12Signer('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('expects pdf to be Buffer', async () => {
        try {
            const signer = new P12Signer(Buffer.from(''));
            await signer.sign('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchSnapshot();
        }
    });
});
