"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Signer = void 0;
var nodeCrypto = _interopRequireWildcard(require("crypto"));
var asn1js = _interopRequireWildcard(require("asn1js"));
var pkijs = _interopRequireWildcard(require("pkijs"));
var _utils = require("@signpdf/utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable no-unused-vars */

// Useful references to understand what is going on here:
//   * PDF: Portable Document Format (ISO 32000-1)
//   * CMS: Cryptographic Message Syntax (RFC 5652)
//   * CAdES: CMS Advanced Electronic Signatures (ETSI 319 122-1)
//   * PAdES: PDF Advanced Electronic Signatures (ETSI 319 142-1)
// Some code comments will refer to these specifications using square brackets,
// e.g. [PDF - 12.8] means section 12.8 of the ISO 32000-1 specification.
// Object identifiers used in the created CMS Signed Data structure
const oids = {
  data: '1.2.840.113549.1.7.1',
  signedData: '1.2.840.113549.1.7.2',
  contentType: '1.2.840.113549.1.9.3',
  messageDigest: '1.2.840.113549.1.9.4',
  signingTime: '1.2.840.113549.1.9.5',
  signingCertificateV2: '1.2.840.113549.1.9.16.2.47'
};

/**
 * Abstract Signer class taking care of creating a suitable signature for a given pdf.
 * Subclasses should specify the required signature and hashing algorithms (either through
 * the `signAlgorithm` and `hashAlgorithm` attributes, or by overriding the `getSignAlgorithm`
 * and `getHashAlgorithm` methods), as well as provide the signing certificate and private key
 * used for signing (by implementing the `getCertificate` and `getKey` methods).
 */
class Signer extends _utils.ISigner {
  /** Signature algorithm used for PDF signing
   * @type {string}
   */
  signAlgorithm = 'RSASSA-PKCS1-v1_5';

  /** Hash algorithm used for PDF signing
   * @type {string}
   */
  hashAlgorithm = 'SHA-256';

  /**
   * Method to retrieve the signature algorithm used for PDF signing.
   * To be implemented by subclasses or set in the `signAlgorithm` attribute.
   * @returns {Promise<string>}
   */
  async getSignAlgorithm() {
    return this.signAlgorithm; // Use default signature algorithm if not overridden by subclass
  }

  /**
   * Method to retrieve the hashing algorithm used for PDF signing.
   * To be implemented by subclasses or set in the `hashAlgorithm` attribute.
   * @returns {Promise<string>}
   */
  async getHashAlgorithm() {
    return this.hashAlgorithm; // Use default hash algorithm if not overridden by subclass
  }

  /**
   * Method to retrieve the signing certificate. If multiple certificates are returned, the first
   * one is used for the actual signing, while the others are added for verification purposes.
   * To be implemented by subclasses.
   * @returns {Promise<Uint8Array | Uint8Array[]>}
   */
  async getCertificate() {
    throw new _utils.SignPdfError(`getCertificate() is not implemented on ${this.constructor.name}`, _utils.SignPdfError.TYPE_INPUT);
  }

  /**
   * Method to retrieve the private key used for signing.
   * The returned private key should be in its PKCS#8 binary representation.
   * To be implemented by subclasses.
   * @returns {Promise<Uint8Array>}
   */
  async getKey() {
    throw new _utils.SignPdfError(`getKey() is not implemented on ${this.constructor.name}`, _utils.SignPdfError.TYPE_INPUT);
  }

  /**
   * Get a "crypto" extension.
   * @returns {pkijs.ICryptoEngine}
   */
  getCrypto() {
    const crypto = new pkijs.CryptoEngine({
      name: 'SignerCrypto',
      crypto: nodeCrypto
    });
    return crypto;
  }

  /**
   * Obtain the certificates used for signing (first one) and verification (whole list).
   * @returns {pkijs.Certificate[]}
   */
  async obtainCertificates() {
    let certBytes = await this.getCertificate();
    if (!Array.isArray(certBytes)) {
      certBytes = [certBytes];
    }
    return certBytes.map(cb => pkijs.Certificate.fromBER(cb));
  }

  /**
   * Obtain the private key used for signing.
   * @returns {CryptoKey}
   */
  async obtainKey() {
    const keyBytes = await this.getKey();
    const algorithmParams = this.crypto.getAlgorithmParameters(this.signAlgorithm, 'importkey').algorithm;
    return this.crypto.importKey('pkcs8', keyBytes, {
      name: this.signAlgorithm,
      ...algorithmParams,
      hash: {
        name: this.hashAlgorithm
      }
    }, false, ['sign']);
  }

  /**
   * Obtain the signed attributes, which are the actual content that is signed in detached mode.
   * @returns {pkijs.Attribute[]}
   */
  async obtainSignedAttributes(signingTime, data, signCert) {
    // Create a message digest
    const digest = await this.crypto.digest({
      name: this.hashAlgorithm
    }, data);
    // Note that the signed attributes order is relevant for correct EU signature validation:
    // https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation
    const signedAttrs = [
    // [CAdES - 5.1.1]
    new pkijs.Attribute({
      type: oids.contentType,
      values: [new asn1js.ObjectIdentifier({
        value: oids.data
      })]
    }),
    // [CAdES - 5.2.1]
    new pkijs.Attribute({
      type: oids.signingTime,
      values: [new asn1js.UTCTime({
        valueDate: signingTime !== null && signingTime !== void 0 ? signingTime : new Date()
      })]
    }),
    // [CAdES - 5.1.2]
    new pkijs.Attribute({
      type: oids.messageDigest,
      values: [new asn1js.OctetString({
        valueHex: digest
      })]
    })];

    // Add the ESS signing certificate attribute (see [CAdES - 5.2.2.3] and [RFC 5035])
    const hashOid = this.crypto.getOIDByAlgorithm({
      name: this.hashAlgorithm
    }, true, 'hashAlgorithm');
    const signCertHash = await this.crypto.digest({
      name: this.hashAlgorithm
    }, signCert.toSchema(true).toBER(false));
    const essCertIDv2 = new asn1js.Sequence({
      value: [
      // hashAlgorithm
      new asn1js.Sequence({
        value: [new asn1js.ObjectIdentifier({
          value: hashOid
        })]
      }),
      // certHash
      new asn1js.OctetString({
        valueHex: signCertHash
      })
      // issuerSerial (omitted here; contained in signerInfo)
      ]
    });

    const signingCertificateV2 = new asn1js.Sequence({
      value: [
      // certs
      new asn1js.Sequence({
        value: [essCertIDv2]
      })
      // policies (shall not be used according to [CAdES - 5.2.2.3])
      ]
    });

    signedAttrs.push(new pkijs.Attribute({
      type: oids.signingCertificateV2,
      values: [signingCertificateV2]
    }));
    return signedAttrs;
  }

  /**
   * Obtain the unsigned attributes.
   * @returns {pkijs.Attribute[]}
   */
  async obtainUnsignedAttributes(signature) {
    return [];
  }

  /**
   * @param {Buffer} pdfBuffer
   * @param {Date | undefined} signingTime
   * @returns {Promise<Buffer>}
   */
  async sign(pdfBuffer, signingTime = undefined) {
    if (!(pdfBuffer instanceof Buffer)) {
      throw new _utils.SignPdfError('PDF expected as Buffer.', _utils.SignPdfError.TYPE_INPUT);
    }

    // Get signature and hash algorithms
    this.signAlgorithm = await this.getSignAlgorithm();
    this.hashAlgorithm = await this.getHashAlgorithm();
    // Get a crypto extension
    this.crypto = this.getCrypto();
    // Get the signing (and verification) certificates
    const certificates = await this.obtainCertificates();
    const signCert = certificates[0];
    // Obtain the private key used for signing
    const key = await this.obtainKey();

    // Creation of the CMS Signed Data structure (see [PDF - 12.8.3.3] and [PAdES - 4.1])
    // Setup signer info (see [CMS - 5.3])
    const signerInfo = new pkijs.SignerInfo({
      version: 1,
      sid: new pkijs.IssuerAndSerialNumber({
        issuer: signCert.issuer,
        serialNumber: signCert.serialNumber
      }),
      signedAttrs: new pkijs.SignedAndUnsignedAttributes({
        type: 0,
        attributes: await this.obtainSignedAttributes(signingTime, pdfBuffer, signCert)
      })
    });

    // Initialize CMS Signed Data structure (see [CMS - 5.1]) and sign it
    const cmsSignedData = new pkijs.SignedData({
      version: 1,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: oids.data // No actual econtent here, as we sign in detached mode
      }),

      signerInfos: [signerInfo],
      certificates
    });

    // Sign in detached mode. That's what Adobe.PPKLite expects for subfilters
    // adbe.pkcs7.detached and ETSI.CAdES.detached.
    await cmsSignedData.sign(key, 0, this.hashAlgorithm, undefined, this.crypto);

    // Append the unsigned attributes, if there are any
    const unsignedAttrs = await this.obtainUnsignedAttributes(signerInfo.signature.getValue());
    if (unsignedAttrs.length > 0) {
      signerInfo.unsignedAttrs = new pkijs.SignedAndUnsignedAttributes({
        type: 1,
        attributes: unsignedAttrs
      });
    }

    // Create final result
    const cmsContentWrap = new pkijs.ContentInfo({
      contentType: oids.signedData,
      content: cmsSignedData.toSchema(true)
    });
    return Buffer.from(cmsContentWrap.toSchema().toBER(false));
  }

  /**
   * Verify whether the signature generated by the sign function is correct.
   * @param {Buffer} cmsSignedBuffer
   * @param {Buffer} pdfBuffer
   * @returns {boolean}
   */
  async verify(cmsSignedBuffer, pdfBuffer) {
    // Based on cmsSignedComplexExample from PKI.js
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsSignedBuffer);
    const cmsSignedSimpl = new pkijs.SignedData({
      schema: cmsContentSimpl.content
    });
    return cmsSignedSimpl.verify({
      signer: 0,
      trustedCerts: [],
      data: pdfBuffer
    }, this.getCrypto());
  }
}
exports.Signer = Signer;