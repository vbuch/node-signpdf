import {SignPdfError} from '@signpdf/utils';
import {Signer} from './Signer';

const params = {
    hash: 'SHA-256',
    sign: 'RSASSA-PKCS1-v1_5',
    cert: 'MIICsTCCAZugAwIBAgIBATALBgkqhkiG9w0BAQswHjEcMAkGA1UEBhMCTk8wDwYDVQQDHggAVABlAHMAdDAeFw0yMzEyMzAxMzU4MjNaFw0yNDEyMzAxMzU4MjNaMB4xHDAJBgNVBAYTAk5PMA8GA1UEAx4IAFQAZQBzAHQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDx7g2c2eoDMrDNXAyZqRnJ9u5eADSJ7xfkwn5UxbrQKgeBFFKXGsSfRY7dOJuW46ZgfrhDUSL0rHoTKxak1eNF8STHPoI3YTj4r/GTlEtLS0q9szlTpg0x9kX4ss6D3Y2m6ll8YuzaDYiVkuZTSKUXYE50RrD3EiNX2GhlTuV8qYq1tiALVzUGnAvlQP4OibMeHt2K+NPIE4zw57zuI1QwYyBuNLoUZHYJw9IqHSapAT1vZjWOSXg5KSzr7v6h1MUxL4zB8yWj3RReUBE6vctXi4mtTsV7cTxyRNuvyQ9Yv0eaC+ixjvHDlaIoskv/+K2KGpaFN+jgukeiLKUrBR5TAgMBAAEwCwYJKoZIhvcNAQELA4IBAQCs3WjG+gDKwHfC2qCW6xiHKwPf2O6xLsstiRtS08U29MgxayPnmqRs73iNTeR3x4dVqX7Fl+/oMac7rg7sNGi5Hkglfx/N6sp/xq7M7+jhC6vc0x0bCdevRcs7QQypMbZIT5ld9BLw0C92/HMYb1QZHhbL98cjoITjwTgzGSl2MA8kph64khBBcx77cwic7bLzOeXaFvFN9/x6H+K1bTxTpcpPaL/tQu9X/ERN4/L+EU+tI2uAM5Rmlyiw70dxB0l2Nr5jVYL33M+Kcvyv3uOZDOgPB7I01SiayJUnc67yJ5rSNY2Ciofp/Sq94Oh6Q1LqTXQswy2v8DzM6Ae5ydLb',
    key: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDx7g2c2eoDMrDNXAyZqRnJ9u5eADSJ7xfkwn5UxbrQKgeBFFKXGsSfRY7dOJuW46ZgfrhDUSL0rHoTKxak1eNF8STHPoI3YTj4r/GTlEtLS0q9szlTpg0x9kX4ss6D3Y2m6ll8YuzaDYiVkuZTSKUXYE50RrD3EiNX2GhlTuV8qYq1tiALVzUGnAvlQP4OibMeHt2K+NPIE4zw57zuI1QwYyBuNLoUZHYJw9IqHSapAT1vZjWOSXg5KSzr7v6h1MUxL4zB8yWj3RReUBE6vctXi4mtTsV7cTxyRNuvyQ9Yv0eaC+ixjvHDlaIoskv/+K2KGpaFN+jgukeiLKUrBR5TAgMBAAECggEARatxPh8/FcauRaVhd4rMA25Z/LYAa0xwTA96g/0hLDs+R/zLP/qUbu2AE9Luc4iBbD5x3+josR9OVGDPN47k0Up9dedZZotX9b3tSruk5zz6fCC1vJIQMLgkNFeBw1W1KkFIndp7LNxC3hgcvhUofc/dJ/0Hj08o4G5QugP7cGdvUdCgaIv9Kc2XgVHuj/jIQ6zh/t16k5LOYbqTkLof0P8uLT5npCBSwzdNtXgq2HnSa65cPKoOvFtNijUQxcMyWlZhUnnETqLPS/QR9925HZfrJD63Swo/tUo8bxNaFuJ4sFUCyRKHuEmwCPIuMBMyyHtDnIrKdMfFLYPDGiR/yQKBgQD8cub9d/Xw5C8YwCQp3Ern043Xj5/QqRtr4CX75hvloiQqW/kDaEDLCny+O2zB6mhMyhiJ3nLiGR7vwNP9xpUFVwxB838tT1RnU3TzwGxX7U4pb+vBgPSJ4tsm6fi5a8iACCOR9Ol0mQSYHGj1V0LjtyeseSENNDDUuXlECHzinQKBgQD1VUVb4frfb4BlmidJ4cNo2Tv+L4zqvsCLBd2AsQgP3/UnvPW5G1ch8wBCaCxMsyPanEJKkNb19xotrz297qj3bnsxnpHT/9mdhysQgtq1cSS/JbgLDH5CxOJkVPYYuFcbFpyYCNjAXdWTVneM6bgDzWn7GaloSbC+z6zfrZJ5rwKBgAVP2aJtusQV2RPZPymOVBkqr2pgwEkgtc4ASmxRfDbJwZ8Ojl/O+sYK83MBRxmReB5dhkSoZJxzUN5UnWFSo2IYYc6ldACdEbaW3/gdDWqQOLvQehJ5Ryv7lQbtl2k3ZmGjSjRRBfSJH7qfpmm7K1IlUXVkmxhvB7QCLxYKY65VAoGAa/AiXfSkzd1e3lTeaFEeCmlZTdJZ64YVbJUeCVraMzHTyLIIYnK2+UbSnGT86JoAclRBjlD/YqRfLi5lucThLku7g+9CNcXhVr97oP4Rf7bR9g+AU8whWPsKqB4BUIr6N/7Q0stBohEmwHZQjvzdaz7bHBEESc/yJWF1q8vQIB0CgYEAyStccHwy2e0pXMg7pbMRzOGrnQkJbv/hISeWpX4YtJpR/IOei2dSchWjhxMcZfWofsiXUvhdcpFt3UIUquyc7e9/uS0Pqx3r9XhB3oUay3AXAIWW0lW5NixRGcLe9On+Ouub2ebDZie4dQ0o9lziQJpuzWZ+O02LYeoj3F9roUQ=',
};

describe(Signer, () => {
    it('expects pdf to be Buffer', async () => {
        try {
            const signer = new Signer();
            await signer.sign('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"PDF expected as Buffer."');
        }
    });
    it('getCertificate method must be implemented', async () => {
        try {
            const signer = new Signer();
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"getCertificate() is not implemented on Signer"');
        }
    });
    it('expects an error when returning an empty certificate buffer', async () => {
        try {
            const signer = new Signer();
            signer.getCertificate = () => Buffer.from('');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Error during parsing of ASN.1 data. Data is not correct for \'Certificate\'."');
        }
    });
    it('getKey method must be implemented', async () => {
        try {
            const signer = new Signer();
            signer.signAlgorithm = params.sign;
            signer.hashAlgorithm = params.hash;
            signer.getCertificate = () => Buffer.from(params.cert, 'base64');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"getKey() is not implemented on Signer"');
        }
    });
    it('expects an error when returning an empty key buffer', async () => {
        try {
            const signer = new Signer();
            signer.signAlgorithm = params.sign;
            signer.hashAlgorithm = params.hash;
            signer.getCertificate = () => Buffer.from(params.cert, 'base64');
            signer.getKey = () => Buffer.from('');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Error during parsing of ASN.1 data. Data is not correct for \'keyData\'."');
        }
    });
    it('expects an error when a non-supported signature algorithm is set', async () => {
        try {
            const signer = new Signer();
            signer.signAlgorithm = 'non-existent';
            signer.hashAlgorithm = params.hash;
            signer.getCertificate = () => Buffer.from(params.cert, 'base64');
            signer.getKey = () => Buffer.from(params.key, 'base64');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Incorrect algorithm name: NON-EXISTENT"');
        }
    });
    it('expects an error when a non-supported hash algorithm is set', async () => {
        try {
            const signer = new Signer();
            signer.signAlgorithm = params.sign;
            signer.hashAlgorithm = 'non-existent';
            signer.getCertificate = () => Buffer.from(params.cert, 'base64');
            signer.getKey = () => Buffer.from(params.key, 'base64');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Incorrect hash algorithm: NON-EXISTENT"');
        }
    });
    it('expects successful signature creation', async () => {
        const data = Buffer.from('test');
        const signer = new Signer();
        signer.signAlgorithm = params.sign;
        signer.hashAlgorithm = params.hash;
        signer.getCertificate = () => Buffer.from(params.cert, 'base64');
        signer.getKey = () => Buffer.from(params.key, 'base64');
        const signature = await signer.sign(data);
        expect(signature instanceof Buffer).toBe(true);
        const verified = await signer.verify(signature, data);
        expect(verified).toBe(true);
    });
});
