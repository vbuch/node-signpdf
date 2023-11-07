export const DEFAULT_SIGNATURE_LENGTH: 8192;
export const DEFAULT_BYTE_RANGE_PLACEHOLDER: "**********";
export const SUBFILTER_ADOBE_PKCS7_DETACHED: "adbe.pkcs7.detached";
export const SUBFILTER_ADOBE_PKCS7_SHA1: "adbe.pkcs7.sha1";
export const SUBFILTER_ADOBE_X509_SHA1: "adbe.x509.rsa.sha1";
export const SUBFILTER_ETSI_CADES_DETACHED: "ETSI.CAdES.detached";
/**
 * Used in the /SigFlags as a bitmask.
 *
 * Flags specifying various document-level characteristics related to signature fields.
 * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}
 * See TABLE 7.42 and 7.43
 */
export type SIG_FLAGS = number;
export namespace SIG_FLAGS {
    let SIGNATURES_EXIST: number;
    let APPEND_ONLY: number;
}
//# sourceMappingURL=const.d.ts.map