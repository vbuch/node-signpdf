export const DEFAULT_SIGNATURE_LENGTH: 8192;
export const DEFAULT_BYTE_RANGE_PLACEHOLDER: "**********";
export const SUBFILTER_ADOBE_PKCS7_DETACHED: "adbe.pkcs7.detached";
export const SUBFILTER_ADOBE_PKCS7_SHA1: "adbe.pkcs7.sha1";
export const SUBFILTER_ADOBE_X509_SHA1: "adbe.x509.rsa.sha1";
export const SUBFILTER_ETSI_CADES_DETACHED: "ETSI.CAdES.detached";
/**
 * Signature flags (bitmask) to be used under /SigFlags.
 *
 * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}
 * See TABLE 7.42 and 7.43
 */
export type SIG_FLAGS = number;
export namespace SIG_FLAGS {
    let SIGNATURES_EXIST: number;
    let APPEND_ONLY: number;
}
/**
 * * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}See TABLE 7.10
 */
export type ANNOTATION_FLAGS = number;
export namespace ANNOTATION_FLAGS {
    let INVISIBLE: number;
    let HIDDEN: number;
    let PRINT: number;
    let NO_ZOOM: number;
    let NO_ROTATE: number;
    let NO_VIEW: number;
    let READ_ONLY: number;
}
//# sourceMappingURL=const.d.ts.map