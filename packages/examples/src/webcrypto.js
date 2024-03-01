var fs = require('fs');
var path = require('path');
var signpdf = require('@signpdf/signpdf').default;
var plainAddPlaceholder = require('@signpdf/placeholder-plain').plainAddPlaceholder;
var Signer = require('@signpdf/signer').Signer;
var createCertificate = require('./utils').createCertificate;

// Signer implementation using the WebCrypto API
class CryptoSigner extends Signer {

    constructor(signAlgorithm = 'RSA-PSS', hashAlgorithm = 'SHA-512') {
        super();

        // 'SHA-256', 'SHA-384' or 'SHA-512' are supported by webcrypto
        this.supportedHashAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];
    
        // 'RSASSA-PKCS1-v1_5', 'RSA-PSS' or 'ECDSA' are supported by webcrypto
        this.supportedSignAlgorithms = ['RSASSA-PKCS1-v1_5', 'RSA-PSS', 'ECDSA'];

        // Verify and set signature and hash algorithms
        if (!this.supportedSignAlgorithms.includes(signAlgorithm)) {
            throw new Error(`Signature algorithm ${signAlgorithm} is not supported by WebCrypto.`);
        }
        this.signAlgorithm = signAlgorithm;
        if (!this.supportedHashAlgorithms.includes(hashAlgorithm)) {
            throw new Error(`Hash algorithm ${hashAlgorithm} is not supported by WebCrypto.`);
        }
        this.hashAlgorithm = hashAlgorithm;

        this.cert = undefined;
        this.key = undefined;
    }

    async getCertificate() {
        // Create a new keypair and certificate
        const algorithmParams = this.crypto.getAlgorithmParameters(this.signAlgorithm, 'generatekey').algorithm;
        const keypair = await this.crypto.generateKey({
            name: this.signAlgorithm,
            ...algorithmParams,
            hash: {name: this.hashAlgorithm},
        }, true, ['sign', 'verify']);
        this.cert = await createCertificate(keypair, this.hashAlgorithm);
        this.key = keypair.privateKey;
        return this.cert;
    }

    async getKey() {
        // Convert private key to binary PKCS#8 representation
        return this.crypto.exportKey("pkcs8", this.key);
    }
}

function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, '/../../../resources/contributing.pdf');
    var pdfBuffer = fs.readFileSync(sourcePath);
    
    // Create new CryptoSigner
    var signAlgorithm = 'RSA-PSS';
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
            var targetPath = path.join(__dirname, '/../output/webcrypto.pdf');
            fs.writeFileSync(targetPath, signedPdf);
        });

}

work();
