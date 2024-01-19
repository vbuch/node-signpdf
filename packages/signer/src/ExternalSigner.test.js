/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as crypto from 'crypto';
import {SignPdfError} from '@signpdf/utils';
import {ExternalSigner} from './ExternalSigner';

const params = {
    rsa: {
        hash: 'SHA-256',
        sign: 'RSASSA-PKCS1-v1_5',
        cert: 'MIICsTCCAZugAwIBAgIBATALBgkqhkiG9w0BAQswHjEcMAkGA1UEBhMCTk8wDwYDVQQDHggAVABlAHMAdDAeFw0yMzEyMzAxMzU4MjNaFw0yNDEyMzAxMzU4MjNaMB4xHDAJBgNVBAYTAk5PMA8GA1UEAx4IAFQAZQBzAHQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDx7g2c2eoDMrDNXAyZqRnJ9u5eADSJ7xfkwn5UxbrQKgeBFFKXGsSfRY7dOJuW46ZgfrhDUSL0rHoTKxak1eNF8STHPoI3YTj4r/GTlEtLS0q9szlTpg0x9kX4ss6D3Y2m6ll8YuzaDYiVkuZTSKUXYE50RrD3EiNX2GhlTuV8qYq1tiALVzUGnAvlQP4OibMeHt2K+NPIE4zw57zuI1QwYyBuNLoUZHYJw9IqHSapAT1vZjWOSXg5KSzr7v6h1MUxL4zB8yWj3RReUBE6vctXi4mtTsV7cTxyRNuvyQ9Yv0eaC+ixjvHDlaIoskv/+K2KGpaFN+jgukeiLKUrBR5TAgMBAAEwCwYJKoZIhvcNAQELA4IBAQCs3WjG+gDKwHfC2qCW6xiHKwPf2O6xLsstiRtS08U29MgxayPnmqRs73iNTeR3x4dVqX7Fl+/oMac7rg7sNGi5Hkglfx/N6sp/xq7M7+jhC6vc0x0bCdevRcs7QQypMbZIT5ld9BLw0C92/HMYb1QZHhbL98cjoITjwTgzGSl2MA8kph64khBBcx77cwic7bLzOeXaFvFN9/x6H+K1bTxTpcpPaL/tQu9X/ERN4/L+EU+tI2uAM5Rmlyiw70dxB0l2Nr5jVYL33M+Kcvyv3uOZDOgPB7I01SiayJUnc67yJ5rSNY2Ciofp/Sq94Oh6Q1LqTXQswy2v8DzM6Ae5ydLb',
        key: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDx7g2c2eoDMrDNXAyZqRnJ9u5eADSJ7xfkwn5UxbrQKgeBFFKXGsSfRY7dOJuW46ZgfrhDUSL0rHoTKxak1eNF8STHPoI3YTj4r/GTlEtLS0q9szlTpg0x9kX4ss6D3Y2m6ll8YuzaDYiVkuZTSKUXYE50RrD3EiNX2GhlTuV8qYq1tiALVzUGnAvlQP4OibMeHt2K+NPIE4zw57zuI1QwYyBuNLoUZHYJw9IqHSapAT1vZjWOSXg5KSzr7v6h1MUxL4zB8yWj3RReUBE6vctXi4mtTsV7cTxyRNuvyQ9Yv0eaC+ixjvHDlaIoskv/+K2KGpaFN+jgukeiLKUrBR5TAgMBAAECggEARatxPh8/FcauRaVhd4rMA25Z/LYAa0xwTA96g/0hLDs+R/zLP/qUbu2AE9Luc4iBbD5x3+josR9OVGDPN47k0Up9dedZZotX9b3tSruk5zz6fCC1vJIQMLgkNFeBw1W1KkFIndp7LNxC3hgcvhUofc/dJ/0Hj08o4G5QugP7cGdvUdCgaIv9Kc2XgVHuj/jIQ6zh/t16k5LOYbqTkLof0P8uLT5npCBSwzdNtXgq2HnSa65cPKoOvFtNijUQxcMyWlZhUnnETqLPS/QR9925HZfrJD63Swo/tUo8bxNaFuJ4sFUCyRKHuEmwCPIuMBMyyHtDnIrKdMfFLYPDGiR/yQKBgQD8cub9d/Xw5C8YwCQp3Ern043Xj5/QqRtr4CX75hvloiQqW/kDaEDLCny+O2zB6mhMyhiJ3nLiGR7vwNP9xpUFVwxB838tT1RnU3TzwGxX7U4pb+vBgPSJ4tsm6fi5a8iACCOR9Ol0mQSYHGj1V0LjtyeseSENNDDUuXlECHzinQKBgQD1VUVb4frfb4BlmidJ4cNo2Tv+L4zqvsCLBd2AsQgP3/UnvPW5G1ch8wBCaCxMsyPanEJKkNb19xotrz297qj3bnsxnpHT/9mdhysQgtq1cSS/JbgLDH5CxOJkVPYYuFcbFpyYCNjAXdWTVneM6bgDzWn7GaloSbC+z6zfrZJ5rwKBgAVP2aJtusQV2RPZPymOVBkqr2pgwEkgtc4ASmxRfDbJwZ8Ojl/O+sYK83MBRxmReB5dhkSoZJxzUN5UnWFSo2IYYc6ldACdEbaW3/gdDWqQOLvQehJ5Ryv7lQbtl2k3ZmGjSjRRBfSJH7qfpmm7K1IlUXVkmxhvB7QCLxYKY65VAoGAa/AiXfSkzd1e3lTeaFEeCmlZTdJZ64YVbJUeCVraMzHTyLIIYnK2+UbSnGT86JoAclRBjlD/YqRfLi5lucThLku7g+9CNcXhVr97oP4Rf7bR9g+AU8whWPsKqB4BUIr6N/7Q0stBohEmwHZQjvzdaz7bHBEESc/yJWF1q8vQIB0CgYEAyStccHwy2e0pXMg7pbMRzOGrnQkJbv/hISeWpX4YtJpR/IOei2dSchWjhxMcZfWofsiXUvhdcpFt3UIUquyc7e9/uS0Pqx3r9XhB3oUay3AXAIWW0lW5NixRGcLe9On+Ouub2ebDZie4dQ0o9lziQJpuzWZ+O02LYeoj3F9roUQ=',
    },
    rsa2: {
        hash: 'SHA-384',
        sign: 'RSA-PSS',
        saltLength: 48,
        cert: 'MIIDHTCCAdGgAwIBAgIBATBBBgkqhkiG9w0BAQowNKAPMA0GCWCGSAFlAwQCAgUAoRwwGgYJKoZIhvcNAQEIMA0GCWCGSAFlAwQCAgUAogMCATAwHjEcMAkGA1UEBhMCTk8wDwYDVQQDHggAVABlAHMAdDAeFw0yMzEyMzAxNzA5NThaFw0yNDEyMzAxNzA5NThaMB4xHDAJBgNVBAYTAk5PMA8GA1UEAx4IAFQAZQBzAHQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDSvg6Di73WPg9msuZ098/E0xy8kXr/2PgPj+mwahdt6FoyG7I9p2dY8gqJmbsHQ38xuFIyfIMO96f7qWjGRHKRqVJF3ioO0T/q0bh5LfrgrylVou5zy9HdmpnSVMu07elZxMDE/62DtIKaauBfpZBi6GpmErVAKDYpUyuF+HPOZYFV4prZNg7bPr5gzIpUuB4rM0YnzdnUze7BGFftQX8IyVJ2lOx+dn83Z9gBOxcQg+Zm2CAqCr6YYmnbiQZPpFuTUsvVwugUTrfw4fYKjl/u55Lpgp3YiDi0hWUEEhELopZHFwg1RlUJIWfJw9quAHZiX50Upa7zQ1QwB3Ai8Xj7AgMBAAEwQQYJKoZIhvcNAQEKMDSgDzANBglghkgBZQMEAgIFAKEcMBoGCSqGSIb3DQEBCDANBglghkgBZQMEAgIFAKIDAgEwA4IBAQAAscloWgW2V/oyLENmuMfQzuHsTD//v2PwSjUgCe3wgiadv7trMSNPYlLSYWgKcrTzxdnjQzgYenpvvYdV3azxwVxQDDJopsECVTQ5CXeI2GjTKQJ+NOnVzmuuksjne0qZHRtXjS0VweUC7zcYGHN6zD3kNgzbCcF+zYVFqdEebTeNZNj7fT29EygBfWM1XTVjwEjC45E9n7w+vfkSN+EKXsIh3Kq3obJh7Q4GKqxPdmXNTmoxfvVuZWohuLhQ6Bg7Ij/tj4P6pwYkE+pqnfdWYX6S1yKMtdCtjkrFf/Ki9pn4dEV8b0L9hfW4t4UeMm17nYC+896RYS5N+eNs/TB5',
        key: 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSvg6Di73WPg9msuZ098/E0xy8kXr/2PgPj+mwahdt6FoyG7I9p2dY8gqJmbsHQ38xuFIyfIMO96f7qWjGRHKRqVJF3ioO0T/q0bh5LfrgrylVou5zy9HdmpnSVMu07elZxMDE/62DtIKaauBfpZBi6GpmErVAKDYpUyuF+HPOZYFV4prZNg7bPr5gzIpUuB4rM0YnzdnUze7BGFftQX8IyVJ2lOx+dn83Z9gBOxcQg+Zm2CAqCr6YYmnbiQZPpFuTUsvVwugUTrfw4fYKjl/u55Lpgp3YiDi0hWUEEhELopZHFwg1RlUJIWfJw9quAHZiX50Upa7zQ1QwB3Ai8Xj7AgMBAAECggEAF/ypA0EPIQkcUKixQYQJYpJS9YWrld540bCkPT++HfTx+z0ayxi4Uy/tkh7s4lVE74BW3sc8VaJLvQHZ2qNk1P6MTkaMy/X2TACF+kkJArT9Q/GRKZ3767jSpFWhgB0KT/zsoh+l/NU5fmEG2+wo5JEmtyqO9df93jNIw211pPrE2LZeet+s5ocu/rDiqdaUvgdK3qGfILepOM9C57YExjj9O/8wB6I0H4l6TPvz/MpVlN34PbTtnu7LbEp1aKhnrYS759x1gkzUnQu58cJSKXzMQc2L9Yz3ZoU0CvDQIajPmco8dQQyvVyCFLrjE+ilEniBqwm82cfl2VWbV8gtSQKBgQDvl1ygY168gUkzIeBORVr17vVOowEWLJeCTu1JIpO/CVSgAAsXb1TUSMjD6M2RTeY5OZxoDJn0dGVjyK2G7i3+r+3kZeek3hU+FVVMjqqc4ZTY6pNoD+ZHpjaXQ8+3hnxVSZVAzZZKQoWsgckAa4OaydnyvoAMm7vQQLOAagtPuQKBgQDhLObjPEQnZQYnQ0BE0h0mbgmIDeubnNxA4SNc761FIPnjqMiZpHpw9augphYl7yaGyMxIZtemBmQ1LE8KqLJ13/cfDAua1eorJusxcBMxaQYi1ftZkyHiHE5oKbDnnhEWZbiclXaipqYu/tkSjKAjVcCjIMjkTT4NRSkMlougUwKBgQDeCiiNe4oQqMBt4rc90oi54vr0JZycMDc5TGwbmy/Rm5QRs/iTf1neYpWs+dOJFeiGoB2TUBpdsoFEOHaY1aNKpUCSqt5CrI6DOsIScSUsvuJzJPH3PsTrId710KJwMvKHF+p6ZA0kRQIdHSpqeTk9+lNB48pH5QvptAymtaBGAQKBgQDYhwEPCejPqQmdv8GRbCqzxaRMvHYPkWsKyHPk7mTD0M366Vbcx5kl/lcniA5MNAfsHDK0fJBqCkNaDl2Ddm0FhHRx2ndeUM146VfIlmkeXkuUPAgTPrSaZXXQHCcM0qbDztUTXXZTOcUb89xxReDHmbJAK0qCnvRIdnTesfVaGQKBgQCtFcrF/Kpj+MR5RHAtbFFQkq/xXZimpdhTbBLmn/AI1T3haYknMEmYDwqAXwrecss+O45U3FQp0jhuDixKp7zx4//xOZVnXqySeFJEJc4W9DZIrmmoo8HdBnJ7LY/J6IDJXyKzIasL4lVifSxNkFtc42ME6OQY4CXKZHD3FsOWxQ==',
    },
    ec: {
        hash: 'SHA-512',
        sign: 'ECDSA',
        cert: 'MIIBKDCBz6ADAgECAgEBMAoGCCqGSM49BAMEMB4xHDAJBgNVBAYTAk5PMA8GA1UEAx4IAFQAZQBzAHQwHhcNMjMxMjMwMTcxMDU5WhcNMjQxMjMwMTcxMDU5WjAeMRwwCQYDVQQGEwJOTzAPBgNVBAMeCABUAGUAcwB0MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEJVixslo+c/efr24AgbSkzJ/g4vDg7tizHZfnfJ/k/CsWa5fyE8lBTVipwIYFITYPBI/9JZTAB0+Hspb6yZ9RJDAKBggqhkjOPQQDBANIADBFAiEAtWiyW4uQc8aR6KaM3FSr9bng1JFPWGm5W79tcHehbqwCICWswWoGKFxcJ98EEiB/IQG/M3Itl5hIdNQrw+reYzbf',
        key: 'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgd+wrLUcK74mALBOgcGaO7badyke95VYEAJyHAMSVQR6hRANCAAQlWLGyWj5z95+vbgCBtKTMn+Di8ODu2LMdl+d8n+T8KxZrl/ITyUFNWKnAhgUhNg8Ej/0llMAHT4eylvrJn1Ek',
    },
};

class CryptoSigner extends ExternalSigner {
    constructor(config) {
        super();
        this.signAlgorithm = params[config].sign;
        this.hashAlgorithm = params[config].hash;
        this.saltLength = params[config].saltLength;
        this.certBase64 = params[config].cert;
        this.keyBase64 = params[config].key;
    }

    async getCertificate() {
        return Buffer.from(this.certBase64, 'base64');
    }

    async getSignature(_hash, data) {
        const key = await crypto.subtle.importKey(
            'pkcs8',
            Buffer.from(this.keyBase64, 'base64'),
            {name: this.signAlgorithm, hash: this.hashAlgorithm, namedCurve: 'P-256'},
            false,
            ['sign'],
        );
        return crypto.subtle.sign({
            name: this.signAlgorithm,
            hash: this.hashAlgorithm,
            saltLength: this.saltLength,
        }, key, data);
    }
}

describe(ExternalSigner, () => {
    it('expects pdf to be Buffer', async () => {
        try {
            const signer = new ExternalSigner();
            await signer.sign('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"PDF expected as Buffer."');
        }
    });
    it('expects an error when getCertificate is not implemented', async () => {
        try {
            const signer = new ExternalSigner();
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.message).toMatchInlineSnapshot('"getCertificate() is not implemented on ExternalSigner"');
        }
    });
    it('expects an error when returning an empty certificate buffer', async () => {
        try {
            const signer = new ExternalSigner();
            signer.getCertificate = () => Buffer.from('');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Error during parsing of ASN.1 data. Data is not correct for \'Certificate\'."');
        }
    });
    it('expects an error when getSignature is not implemented', async () => {
        try {
            const signer = new ExternalSigner();
            signer.getCertificate = () => Buffer.from(params.rsa.cert, 'base64');
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.message).toMatchInlineSnapshot('"getSignature() is not implemented on ExternalSigner"');
        }
    });
    it('expects invalid signature when returning an empty signature buffer', async () => {
        const data = Buffer.from('test');
        const signer = new ExternalSigner();
        signer.getCertificate = () => Buffer.from(params.rsa.cert, 'base64');
        signer.getSignature = () => Buffer.from('');
        const signature = await signer.sign(data);
        const verified = await signer.verify(signature, data);
        expect(verified).toBe(false);
    });
    it('expects an error when a non-supported signature algorithm is returned', async () => {
        try {
            const signer = new CryptoSigner('rsa');
            signer.signAlgorithm = 'non-existent';
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Unrecognized algorithm name"');
        }
    });
    it('expects an error when a non-supported hash algorithm is returned', async () => {
        try {
            const signer = new CryptoSigner('rsa');
            signer.hashAlgorithm = 'non-existent';
            await signer.sign(Buffer.from(''));
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(false);
            expect(e.message).toMatchInlineSnapshot('"Unrecognized algorithm name"');
        }
    });
    it('expects successful signature creation', async () => {
        const data = Buffer.from('test');
        for (const cfg of Object.keys(params)) {
            const signer = new CryptoSigner(cfg);
            const signature = await signer.sign(data);
            expect(signature instanceof Buffer).toBe(true);
            const verified = await signer.verify(signature, data);
            expect(verified).toBe(true);
        }
    });
});
