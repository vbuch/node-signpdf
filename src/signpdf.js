import forge from 'node-forge';

export default {
    BYTERANGE_PLACEHOLDER: '**********',
    SIGNATURE_MAX_LENGTH: 8192,
    PKCS12_CERT_BAG: '1.2.840.113549.1.12.10.1.3',
    PKCS12_KEY_BAG: '1.2.840.113549.1.12.10.1.2',
    
    sign: (pdfBuffer, p12Buffer) => {
        if (!(pdfBuffer instanceof Buffer)) {
            throw new Error('PDF expected as Buffer.');
        }
        if (!(p12Buffer instanceof Buffer)) {
            throw new Error('p12 certificate expected as Buffer.');
        }
    },
};