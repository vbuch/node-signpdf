import forge from 'node-forge';
import {SignPdfError} from '@signpdf/utils';
import {readTestResource} from '@signpdf/internal-utils';
import {P12Signer} from './P12Signer';

describe(P12Signer, () => {
    it('expects P12 certificate to be Buffer', () => {
        try {
            // eslint-disable-next-line no-new
            new P12Signer(['non-buffer']);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"p12 certificate expected as Buffer, Uint8Array or base64-encoded string."');
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
            expect(e.message).toMatchInlineSnapshot('"PDF expected as Buffer."');
        }
    });
    it('expects a node-forge error when giving empty certificate buffer', async () => {
        try {
            const signer = new P12Signer(Buffer.from(''));
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Too few bytes to parse DER."');
        }
    });
    it('expects successful signature creation with a p12', async () => {
        const p12 = readTestResource('certificate.p12');
        const signer = new P12Signer(p12);
        const signature = await signer.sign(Buffer.from(''));
        expect(signature instanceof Buffer).toBe(true);
    });
    it('expects successful signature creation with a p12 bundle', async () => {
        const p12 = readTestResource('bundle.p12');
        const signer = new P12Signer(p12);
        const signature = await signer.sign(Buffer.from(''));
        expect(signature instanceof Buffer).toBe(true);
    });
    it('errors when no matching certificate is found in bags', async () => {
        const p12Buffer = readTestResource('bundle.p12');
        const signer = new P12Signer(p12Buffer);

        // Monkey-patch pkcs12 to return no matching certificates although bundle.p12 is correct.
        const originalPkcs12FromAsn1 = forge.pkcs12.pkcs12FromAsn1;
        let p12Instance;
        forge.pkcs12.pkcs12FromAsn1 = (...params) => {
            // This instance will be used for all non-mocked code.
            p12Instance = originalPkcs12FromAsn1(...params);

            return {
                ...p12Instance,
                getBags: ({bagType}) => {
                    if (bagType === forge.pki.oids.certBag) {
                        // Only mock this case.
                        // Make sure there will be no matching certificate.
                        return {
                            [forge.pki.oids.certBag]: [],
                        };
                    }
                    return p12Instance.getBags({bagType});
                },
            };
        };

        try {
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"Failed to find a certificate that matches the private key."');
        } finally {
            forge.pkcs12.pkcs12FromAsn1 = originalPkcs12FromAsn1;
        }
    });
    it('errors on wrong certificate passphrase', async () => {
        const p12Buffer = readTestResource('withpass.p12');
        const signer = new P12Signer(p12Buffer, {passphrase: 'Wrong passphrase'});

        try {
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof Error).toBe(true);
            expect(e.message).toMatchInlineSnapshot('"PKCS#12 MAC could not be verified. Invalid password?"');
        }
    });
    it('signs with passphrased certificate', async () => {
        const p12Buffer = readTestResource('withpass.p12');
        const signer = new P12Signer(p12Buffer, {passphrase: 'node-signpdf'});

        const signature = await signer.sign(Buffer.from(''));
        expect(signature instanceof Buffer).toBe(true);
    });
});
