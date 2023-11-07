"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SUBFILTER_ETSI_CADES_DETACHED = exports.SUBFILTER_ADOBE_X509_SHA1 = exports.SUBFILTER_ADOBE_PKCS7_SHA1 = exports.SUBFILTER_ADOBE_PKCS7_DETACHED = exports.SIG_FLAGS = exports.DEFAULT_SIGNATURE_LENGTH = exports.DEFAULT_BYTE_RANGE_PLACEHOLDER = void 0;
const DEFAULT_SIGNATURE_LENGTH = exports.DEFAULT_SIGNATURE_LENGTH = 8192;
const DEFAULT_BYTE_RANGE_PLACEHOLDER = exports.DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
const SUBFILTER_ADOBE_PKCS7_DETACHED = exports.SUBFILTER_ADOBE_PKCS7_DETACHED = 'adbe.pkcs7.detached';
const SUBFILTER_ADOBE_PKCS7_SHA1 = exports.SUBFILTER_ADOBE_PKCS7_SHA1 = 'adbe.pkcs7.sha1';
const SUBFILTER_ADOBE_X509_SHA1 = exports.SUBFILTER_ADOBE_X509_SHA1 = 'adbe.x509.rsa.sha1';
const SUBFILTER_ETSI_CADES_DETACHED = exports.SUBFILTER_ETSI_CADES_DETACHED = 'ETSI.CAdES.detached';

/**
 * Used in the /SigFlags as a bitmask.
 *
 * Flags specifying various document-level characteristics related to signature fields.
 * {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.3.pdf}
 * See TABLE 7.42 and 7.43
 * @readonly
 * @enum {number}
 */
const SIG_FLAGS = exports.SIG_FLAGS = {
  /**
   * If set, the document contains at least one signature field.
   */
  SIGNATURES_EXIST: 1,
  /**
   * If set, the document contains signatures that may be invalidated
   * if the file is saved (written) in a way that alters its previous contents.
   */
  APPEND_ONLY: 2
};