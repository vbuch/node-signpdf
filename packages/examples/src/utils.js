var nodeCrypto = require('crypto');
var asn1js = require('asn1js');
var pkijs = require('pkijs');

// Get crypto extension
const crypto = new pkijs.CryptoEngine({name: 'CertCrypto', crypto: nodeCrypto});

async function createCertificate(keypair, hashAlg) {
    // Create a new certificate for the given keypair and hash algorithm.
    // Based on the certificateComplexExample from PKI.js.
    const certificate = new pkijs.Certificate();

    // Basic attributes
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: 1 });
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({value: "NO"}),
    }));
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({value: "Test"}),
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({value: "NO"}),
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({value: "Test"}),
    }));

    certificate.notBefore.value = new Date();
    certificate.notAfter.value = new Date();
    certificate.notAfter.value.setFullYear(certificate.notAfter.value.getFullYear() + 1);

    // Export public key into "subjectPublicKeyInfo" value of certificate
    await certificate.subjectPublicKeyInfo.importKey(keypair.publicKey, crypto);

    // Sign certificate
    await certificate.sign(keypair.privateKey, hashAlg, crypto);

    return certificate.toSchema(true).toBER(false);
}

module.exports.createCertificate = createCertificate;
