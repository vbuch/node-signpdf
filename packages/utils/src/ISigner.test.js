import {SignPdfError} from './SignPdfError';
import {ISigner} from './ISigner';

describe(ISigner, () => {
    it('sign method must be implemented', async () => {
        try {
            const signer = new ISigner();
            await signer.sign('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"sign() is not implemented on ISigner"');
        }
    });
});
