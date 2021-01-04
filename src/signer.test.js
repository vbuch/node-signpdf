import SignPdfError from './SignPdfError';
import Signer from './signer';

describe('Test signing', () => {
    it('sign method must be implemented', async () => {
        try {
            const signer = new Signer(Buffer.from(''));
            await signer.sign('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchSnapshot();
        }
    });
});
