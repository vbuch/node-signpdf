"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _const = require("./const");

/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {PDFDocument} pdf
 * @param {string} reason
 * @returns {object}
 */
const pdfkitAddPlaceholder = ({
  pdf,
  reason,
  signatureLength = _const.DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = _const.DEFAULT_BYTE_RANGE_PLACEHOLDER
}) => {
  /* eslint-disable no-underscore-dangle,no-param-reassign */
  // Generate the signature placeholder
  const signature = pdf.ref({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: [0, byteRangePlaceholder, byteRangePlaceholder, byteRangePlaceholder],
    Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
    Reason: new String(reason),
    // eslint-disable-line no-new-wrappers
    M: new Date()
  }); // Generate signature annotation widget

  const widget = pdf.ref({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: [0, 0, 0, 0],
    V: signature,
    T: new String('Signature1'),
    // eslint-disable-line no-new-wrappers
    F: 4,
    P: pdf.page.dictionary // eslint-disable-line no-underscore-dangle

  }); // Include the widget in a page

  pdf.page.dictionary.data.Annots = [widget]; // Create a form (with the widget) and link in the _root

  const form = pdf.ref({
    Type: 'AcroForm',
    SigFlags: 3,
    Fields: [widget]
  });
  pdf._root.data.AcroForm = form;
  return {
    signature,
    form,
    widget
  };
  /* eslint-enable no-underscore-dangle,no-param-reassign */
};

var _default = pdfkitAddPlaceholder;
exports.default = _default;