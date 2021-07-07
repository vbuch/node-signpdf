"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeForge = _interopRequireDefault(require("node-forge"));

var _SignPdfError = _interopRequireDefault(require("../SignPdfError"));

var _signer = _interopRequireDefault(require("../signer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class P12Signer extends _signer.default {
  constructor(p12Buffer, additionalOptions = {}) {
    super();

    if (!(p12Buffer instanceof Buffer)) {
      throw new _SignPdfError.default('p12 certificate expected as Buffer.', _SignPdfError.default.TYPE_INPUT);
    }

    this.options = {
      asn1StrictParsing: false,
      passphrase: '',
      ...additionalOptions
    };
    this.cert = _nodeForge.default.util.createBuffer(p12Buffer.toString('binary'));
  }

  sign(pdfBuffer) {
    if (!(pdfBuffer instanceof Buffer)) {
      throw new _SignPdfError.default('PDF expected as Buffer.', _SignPdfError.default.TYPE_INPUT);
    } // Convert Buffer P12 to a forge implementation.


    const p12Asn1 = _nodeForge.default.asn1.fromDer(this.cert);

    const p12 = _nodeForge.default.pkcs12.pkcs12FromAsn1(p12Asn1, this.options.asn1StrictParsing, this.options.passphrase); // Extract safe bags by type.
    // We will need all the certificates and the private key.


    const certBags = p12.getBags({
      bagType: _nodeForge.default.pki.oids.certBag
    })[_nodeForge.default.pki.oids.certBag];

    const keyBags = p12.getBags({
      bagType: _nodeForge.default.pki.oids.pkcs8ShroudedKeyBag
    })[_nodeForge.default.pki.oids.pkcs8ShroudedKeyBag];

    const privateKey = keyBags[0].key; // Here comes the actual PKCS#7 signing.

    const p7 = _nodeForge.default.pkcs7.createSignedData(); // Start off by setting the content.


    p7.content = _nodeForge.default.util.createBuffer(pdfBuffer.toString('binary')); // Then add all the certificates (-cacerts & -clcerts)
    // Keep track of the last found client certificate.
    // This will be the public key that will be bundled in the signature.

    let certificate;
    Object.keys(certBags).forEach(i => {
      const {
        publicKey
      } = certBags[i].cert;
      p7.addCertificate(certBags[i].cert); // Try to find the certificate that matches the private key.

      if (privateKey.n.compareTo(publicKey.n) === 0 && privateKey.e.compareTo(publicKey.e) === 0) {
        certificate = certBags[i].cert;
      }
    });

    if (typeof certificate === 'undefined') {
      throw new _SignPdfError.default('Failed to find a certificate that matches the private key.', _SignPdfError.default.TYPE_INPUT);
    } // Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.


    p7.addSigner({
      key: privateKey,
      certificate,
      digestAlgorithm: _nodeForge.default.pki.oids.sha256,
      authenticatedAttributes: [{
        type: _nodeForge.default.pki.oids.contentType,
        value: _nodeForge.default.pki.oids.data
      }, {
        type: _nodeForge.default.pki.oids.messageDigest // value will be auto-populated at signing time

      }, {
        type: _nodeForge.default.pki.oids.signingTime,
        // value can also be auto-populated at signing time
        // We may also support passing this as an option to sign().
        // Would be useful to match the creation time of the document for example.
        value: new Date()
      }]
    }); // Sign in detached mode.

    p7.sign({
      detached: true
    });
    return Buffer.from(_nodeForge.default.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');
  }

}

exports.default = P12Signer;