"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExternalSigner = void 0;
var pkijs = _interopRequireWildcard(require("pkijs"));
var _utils = require("@signpdf/utils");
var _Signer = require("./Signer");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable no-unused-vars */

/**
 * Abstract ExternalSigner class taking care of creating a suitable signature for a given pdf
 * using an external signature provider.
 * Subclasses should specify the required signature and hashing algorithms used by the external
 * provider (either through the `signAlgorithm` and `hashAlgorithm` attributes, or by overriding
 * the `getSignAlgorithm` and `getHashAlgorithm` methods), as well as provide the used signing
 * certificate and final signature (by implementing the `getCertificate` and `getSignature`
 * methods).
 */
class ExternalSigner extends _Signer.Signer {
  /**
   * Method to retrieve the signature of the given hash (of the given data) from the external
   * service. The original data is included in case the external signature provider computes
   * the hash automatically before signing.
   * To be implemented by subclasses.
   * @param {Uint8Array} hash
   * @param {Uint8Array} data
   * @returns {Promise<Uint8Array>}
   */
  async getSignature(hash, data) {
    throw new _utils.SignPdfError(`getSignature() is not implemented on ${this.constructor.name}`, _utils.SignPdfError.TYPE_INPUT);
  }

  /**
   * Get a "crypto" extension and override the function used by SignedData.sign to support
   * external signing.
   * @returns {pkijs.ICryptoEngine}
   */
  getCrypto() {
    const crypto = super.getCrypto();
    crypto.sign = async (_algo, _key, data) => {
      // Calculate hash
      const hash = await crypto.digest({
        name: this.hashAlgorithm
      }, data);
      // And pass it to the external signature provider
      const signature = await this.getSignature(Buffer.from(hash), Buffer.from(data));
      return signature;
    };
    return crypto;
  }

  /**
   * Obtain a dummy private key to pass the correct signing parameters to the sign function.
   * @returns {CryptoKey}
   */
  async obtainKey() {
    // The algorithm parameters cannot be passed directly to the SignedData.sign function, so we
    // need to generate a dummy private key with the required parameters and pass that to the
    // sign function. The private key is not actually used for signing, as we override the
    // crypto.sign function in the getCrypto method.
    const algorithmParams = this.crypto.getAlgorithmParameters(this.signAlgorithm, 'generatekey').algorithm;
    const keypair = await this.crypto.generateKey({
      name: this.signAlgorithm,
      ...algorithmParams,
      hash: {
        name: this.hashAlgorithm
      }
    }, false, ['sign', 'verify']);
    return keypair.privateKey;
  }
}
exports.ExternalSigner = ExternalSigner;