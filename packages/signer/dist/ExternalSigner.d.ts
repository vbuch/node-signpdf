/**
 * Abstract ExternalSigner class taking care of creating a suitable signature for a given pdf
 * using an external signature provider.
 * Subclasses should specify the required signature and hashing algorithms used by the external
 * provider (either through the `signAlgorithm` and `hashAlgorithm` attributes, or by overriding
 * the `getSignAlgorithm` and `getHashAlgorithm` methods), as well as provide the used signing
 * certificate and final signature (by implementing the `getCertificate` and `getSignature`
 * methods).
 */
export class ExternalSigner extends Signer {
    /**
     * Method to retrieve the signature of the given hash (of the given data) from the external
     * service. The original data is included in case the external signature provider computes
     * the hash automatically before signing.
     * To be implemented by subclasses.
     * @param {Uint8Array} hash
     * @param {Uint8Array} data
     * @returns {Promise<Uint8Array>}
     */
    getSignature(hash: Uint8Array, data: Uint8Array): Promise<Uint8Array>;
}
import { Signer } from './Signer';
//# sourceMappingURL=ExternalSigner.d.ts.map