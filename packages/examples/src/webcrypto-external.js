var fs = require('fs');
var path = require('path');
var signpdf = require('@signpdf/signpdf').default;
var plainAddPlaceholder = require('@signpdf/placeholder-plain').plainAddPlaceholder;
var ExternalSigner = require('@signpdf/signer').ExternalSigner;
var crypto = require('crypto');
var createCertificate = require('./utils').createCertificate;

// ExternalSigner implementation using the WebCrypto API
// Note that this is just an example implementation of the ExternalSigner abstract class.
// WebCrypto signing can also be implemented more easily by subclassing the Signer abstract
// class directly, as is done in the `webcrypto.js` example script.
class CryptoSigner extends ExternalSigner {
    // 'SHA-256', 'SHA-384' or 'SHA-512' are supported by webcrypto
    supportedHashAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];

    // 'RSASSA-PKCS1-v1_5', 'RSA-PSS' or 'ECDSA' are supported by webcrypto
    supportedSignAlgorithms = ['RSASSA-PKCS1-v1_5', 'RSA-PSS', 'ECDSA'];

    constructor(signAlgorithm = 'ECDSA', hashAlgorithm = 'SHA-512') {
        super();

        // Verify and set signature and hash algorithms
        if (!this.supportedSignAlgorithms.includes(signAlgorithm)) {
            throw new Error(`Signature algorithm ${signAlgorithm} is not supported by WebCrypto.`);
        }
        this.signAlgorithm = signAlgorithm;
        if (!this.supportedHashAlgorithms.includes(hashAlgorithm)) {
            throw new Error(`Hash algorithm ${hashAlgorithm} is not supported by WebCrypto.`);
        }
        this.hashAlgorithm = hashAlgorithm;

        // Salt lengths for RSA-PSS algorithm used by PKI.js
        // If you want to modify these, the crypto.getSignatureParameters
        // method needs to be overridden in the getCrypto function.
        this.saltLengths = {
            'SHA-256': 32,
            'SHA-384': 48,
            'SHA-512': 64,
        }

        this.cert = undefined;
        this.key = undefined;
    }

    async getCertificate() {
        // Create a new keypair and certificate
        let params = {namedCurve: 'P-256'}; // EC parameters
        if (this.signAlgorithm.startsWith("RSA")) {
            // RSA parameters
            params = {
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: this.hashAlgorithm,
            };
        }
        const keypair = await crypto.subtle.generateKey({
            name: this.signAlgorithm,
            ...params,
        }, true, ['sign', 'verify']);
        this.cert = await createCertificate(keypair, this.hashAlgorithm);
        this.key = keypair.privateKey;
        return this.cert;
    }

    async getSignature(_hash, data) {
        // WebCrypto's sign function automatically computes the hash of the passed data before signing.
        return crypto.subtle.sign({
            name: this.signAlgorithm,
            hash: this.hashAlgorithm, // Required for ECDSA algorithm
            saltLength: this.saltLengths[this.hashAlgorithm], // Required for RSA-PSS algorithm
        }, this.key, data);
    }
}

function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, '/../../../resources/contributing.pdf');
    var pdfBuffer = fs.readFileSync(sourcePath);
    
    // Create new CryptoSigner
    var signAlgorithm = 'ECDSA';
    var hashAlgorithm = 'SHA-512';
    var signer = new CryptoSigner(signAlgorithm, hashAlgorithm);

    // The PDF needs to have a placeholder for a signature to be signed.
    var pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer: pdfBuffer,
        reason: 'The user is declaring consent through JavaScript.',
        contactInfo: 'signpdf@example.com',
        name: 'John Doe',
        location: 'Free Text Str., Free World',
    });

    // pdfWithPlaceholder is now a modified Buffer that is ready to be signed.
    signpdf.sign(pdfWithPlaceholder, signer)
        .then(function (signedPdf) {
            // signedPdf is a Buffer of an electronically signed PDF. Store it.
            var targetPath = path.join(__dirname, '/../output/webcrypto-external.pdf');
            fs.writeFileSync(targetPath, signedPdf);
        });

}

work();
