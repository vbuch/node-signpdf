"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SignPdf = void 0;
var _nodeForge = _interopRequireDefault(require("node-forge"));
var _utils = require("@signpdf/utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @typedef {object} SignerOptions
 * @prop {string} [passphrase]
 * @prop {boolean} [asn1StrictParsing]
 */

class SignPdf {
  constructor() {
    this.byteRangePlaceholder = _utils.DEFAULT_BYTE_RANGE_PLACEHOLDER;
    this.lastSignature = null;
  }

  /**
   * @param {Buffer} pdfBuffer
   * @param {Buffer} p12Buffer
   * @param {SignerOptions} additionalOptions
   * @returns {Buffer}
   */
  sign(pdfBuffer, p12Buffer, additionalOptions = {}) {
    const options = {
      asn1StrictParsing: false,
      passphrase: '',
      ...additionalOptions
    };
    if (!(pdfBuffer instanceof Buffer)) {
      throw new _utils.SignPdfError('PDF expected as Buffer.', _utils.SignPdfError.TYPE_INPUT);
    }
    if (!(p12Buffer instanceof Buffer)) {
      throw new _utils.SignPdfError('p12 certificate expected as Buffer.', _utils.SignPdfError.TYPE_INPUT);
    }
    let pdf = (0, _utils.removeTrailingNewLine)(pdfBuffer);

    // Find the ByteRange placeholder.
    const {
      byteRangePlaceholder
    } = (0, _utils.findByteRange)(pdf);
    if (!byteRangePlaceholder) {
      throw new _utils.SignPdfError(`Could not find empty ByteRange placeholder: ${byteRangePlaceholder}`, _utils.SignPdfError.TYPE_PARSE);
    }
    const byteRangePos = pdf.indexOf(byteRangePlaceholder);

    // Calculate the actual ByteRange that needs to replace the placeholder.
    const byteRangeEnd = byteRangePos + byteRangePlaceholder.length;
    const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd);
    const placeholderPos = pdf.indexOf('<', contentsTagPos);
    const placeholderEnd = pdf.indexOf('>', placeholderPos);
    const placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos;
    const placeholderLength = placeholderLengthWithBrackets - 2;
    const byteRange = [0, 0, 0, 0];
    byteRange[1] = placeholderPos;
    byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
    byteRange[3] = pdf.length - byteRange[2];
    let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
    actualByteRange += ' '.repeat(byteRangePlaceholder.length - actualByteRange.length);

    // Replace the /ByteRange placeholder with the actual ByteRange
    pdf = Buffer.concat([pdf.slice(0, byteRangePos), Buffer.from(actualByteRange), pdf.slice(byteRangeEnd)]);

    // Remove the placeholder signature
    pdf = Buffer.concat([pdf.slice(0, byteRange[1]), pdf.slice(byteRange[2], byteRange[2] + byteRange[3])]);

    // Convert Buffer P12 to a forge implementation.
    const forgeCert = _nodeForge.default.util.createBuffer(p12Buffer.toString('binary'));
    const p12Asn1 = _nodeForge.default.asn1.fromDer(forgeCert);
    const p12 = _nodeForge.default.pkcs12.pkcs12FromAsn1(p12Asn1, options.asn1StrictParsing, options.passphrase);

    // Extract safe bags by type.
    // We will need all the certificates and the private key.
    const certBags = p12.getBags({
      bagType: _nodeForge.default.pki.oids.certBag
    })[_nodeForge.default.pki.oids.certBag];
    const keyBags = p12.getBags({
      bagType: _nodeForge.default.pki.oids.pkcs8ShroudedKeyBag
    })[_nodeForge.default.pki.oids.pkcs8ShroudedKeyBag];
    const privateKey = keyBags[0].key;
    // Here comes the actual PKCS#7 signing.
    const p7 = _nodeForge.default.pkcs7.createSignedData();
    // Start off by setting the content.
    p7.content = _nodeForge.default.util.createBuffer(pdf.toString('binary'));

    // Then add all the certificates (-cacerts & -clcerts)
    // Keep track of the last found client certificate.
    // This will be the public key that will be bundled in the signature.
    let certificate;
    Object.keys(certBags).forEach(i => {
      const {
        publicKey
      } = certBags[i].cert;
      p7.addCertificate(certBags[i].cert);

      // Try to find the certificate that matches the private key.
      if (privateKey.n.compareTo(publicKey.n) === 0 && privateKey.e.compareTo(publicKey.e) === 0) {
        certificate = certBags[i].cert;
      }
    });
    if (typeof certificate === 'undefined') {
      throw new _utils.SignPdfError('Failed to find a certificate that matches the private key.', _utils.SignPdfError.TYPE_INPUT);
    }

    // Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.
    // Note that the authenticatedAttributes order is relevant for correct
    // EU signature validation:
    // https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation
    p7.addSigner({
      key: privateKey,
      certificate,
      digestAlgorithm: _nodeForge.default.pki.oids.sha256,
      authenticatedAttributes: [{
        type: _nodeForge.default.pki.oids.contentType,
        value: _nodeForge.default.pki.oids.data
      }, {
        type: _nodeForge.default.pki.oids.signingTime,
        // value can also be auto-populated at signing time
        // We may also support passing this as an option to sign().
        // Would be useful to match the creation time of the document for example.
        value: new Date()
      }, {
        type: _nodeForge.default.pki.oids.messageDigest
        // value will be auto-populated at signing time
      }]
    });

    // Sign in detached mode.
    p7.sign({
      detached: true
    });

    // Check if the PDF has a good enough placeholder to fit the signature.
    const raw = _nodeForge.default.asn1.toDer(p7.toAsn1()).getBytes();
    // placeholderLength represents the length of the HEXified symbols but we're
    // checking the actual lengths.
    if (raw.length * 2 > placeholderLength) {
      throw new _utils.SignPdfError(`Signature exceeds placeholder length: ${raw.length * 2} > ${placeholderLength}`, _utils.SignPdfError.TYPE_INPUT);
    }
    let signature = Buffer.from(raw, 'binary').toString('hex');
    // Store the HEXified signature. At least useful in tests.
    this.lastSignature = signature;

    // Pad the signature with zeroes so the it is the same length as the placeholder
    signature += Buffer.from(String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length)).toString('hex');

    // Place it in the document.
    pdf = Buffer.concat([pdf.slice(0, byteRange[1]), Buffer.from(`<${signature}>`), pdf.slice(byteRange[1])]);

    // Magic. Done.
    return pdf;
  }
}
exports.SignPdf = SignPdf;
var _default = exports.default = new SignPdf();