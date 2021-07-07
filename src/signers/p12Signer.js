import forge from 'node-forge';
import SignPdfError from '../SignPdfError';
import Signer from '../signer';

export default class P12Signer extends Signer {
    constructor(p12Buffer, additionalOptions = {}) {
        super();
        if (!(p12Buffer instanceof Buffer)) {
            throw new SignPdfError(
                'p12 certificate expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }
        this.options = {
            asn1StrictParsing: false,
            passphrase: '',
            ...additionalOptions,
        };
        this.cert = forge.util.createBuffer(p12Buffer.toString('binary'));
    }

    sign(pdfBuffer) {
        if (!(pdfBuffer instanceof Buffer)) {
            throw new SignPdfError(
                'PDF expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }
        // Convert Buffer P12 to a forge implementation.
        const p12Asn1 = forge.asn1.fromDer(this.cert);
        const p12 = forge.pkcs12.pkcs12FromAsn1(
            p12Asn1,
            this.options.asn1StrictParsing,
            this.options.passphrase,
        );

        // Extract safe bags by type.
        // We will need all the certificates and the private key.
        const certBags = p12.getBags({
            bagType: forge.pki.oids.certBag,
        })[forge.pki.oids.certBag];
        const keyBags = p12.getBags({
            bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
        })[forge.pki.oids.pkcs8ShroudedKeyBag];

        const privateKey = keyBags[0].key;
        // Here comes the actual PKCS#7 signing.
        const p7 = forge.pkcs7.createSignedData();
        // Start off by setting the content.
        p7.content = forge.util.createBuffer(pdfBuffer.toString('binary'));

        // Then add all the certificates (-cacerts & -clcerts)
        // Keep track of the last found client certificate.
        // This will be the public key that will be bundled in the signature.
        let certificate;
        Object.keys(certBags).forEach((i) => {
            const {publicKey} = certBags[i].cert;

            p7.addCertificate(certBags[i].cert);

            // Try to find the certificate that matches the private key.
            if (privateKey.n.compareTo(publicKey.n) === 0
                && privateKey.e.compareTo(publicKey.e) === 0
            ) {
                certificate = certBags[i].cert;
            }
        });

        if (typeof certificate === 'undefined') {
            throw new SignPdfError(
                'Failed to find a certificate that matches the private key.',
                SignPdfError.TYPE_INPUT,
            );
        }

        // Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.
        p7.addSigner({
            key: privateKey,
            certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data,
                }, {
                    type: forge.pki.oids.messageDigest,
                    // value will be auto-populated at signing time
                }, {
                    type: forge.pki.oids.signingTime,
                    // value can also be auto-populated at signing time
                    // We may also support passing this as an option to sign().
                    // Would be useful to match the creation time of the document for example.
                    value: new Date(),
                },
            ],
        });

        // Sign in detached mode.
        p7.sign({detached: true});

        return Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');
    }
}
