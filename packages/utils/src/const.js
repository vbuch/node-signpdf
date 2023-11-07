export const DEFAULT_SIGNATURE_LENGTH = 8192;
export const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';

export const SUBFILTER_ADOBE_PKCS7_DETACHED = 'adbe.pkcs7.detached';
export const SUBFILTER_ADOBE_PKCS7_SHA1 = 'adbe.pkcs7.sha1';
export const SUBFILTER_ADOBE_X509_SHA1 = 'adbe.x509.rsa.sha1';
export const SUBFILTER_ETSI_CADES_DETACHED = 'ETSI.CAdES.detached';

/**
 * Signature flags (bitmask) to be used under /SigFlags.
 *
 * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}
 * See TABLE 7.42 and 7.43
 * @readonly
 * @enum {number}
 */
export const SIG_FLAGS = {
    /**
     * If set, the document contains at least one signature field.
     */
    SIGNATURES_EXIST: 1,
    /**
     * If set, the document contains signatures that may be invalidated
     * if the file is saved (written) in a way that alters its previous contents.
     */
    APPEND_ONLY: 2,
};

/**
 * Annotation flags (bitmask) to be used in /F under /Annot
 *
 * @readonly
 * @enum {number}
 * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}
 * See TABLE 7.10
 */
export const ANNOTATION_FLAGS = {
    /**
     * If set, do not display the annotation if it does not belong to one of the
     * standard annotation types and no annotation handler is available.
     */
    INVISIBLE: 1,

    /**
     * If set, do not display or print the annotation or allow it to interact with the user,
     * regardless of its annotation type or whether an annotation handler is available.
     */
    HIDDEN: 2,

    /**
     * If set, print the annotation when the page is printed. If clear, never print the
     * annotation, regardless of whether it is displayed on the screen.
     */
    PRINT: 4,

    /**
     * If set, do not scale the annotation’s appearance to match the magnification of the page.
     */
    NO_ZOOM: 8,

    /**
     * If set, do not rotate the annotation’s appearance to match the rotation of the page.
     */
    NO_ROTATE: 16,

    /**
     * If set, do not display the annotation on the screen or allow it to interact with the user.
     */
    NO_VIEW: 32,

    /**
     * If set, do not allow the annotation to interact with the user.
     */
    READ_ONLY: 64,
};
