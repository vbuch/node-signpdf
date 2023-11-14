"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pdflibAddPlaceholder = void 0;
var _utils = require("@signpdf/utils");
var _pdfLib = require("pdf-lib");
/**
 * @typedef {import('pdf-lib').PDFDocument} PDFDocument
 */

/**
* @typedef {object} InputType
* @property {PDFDocument} pdfDoc
* @property {string} reason
* @property {string} contactInfo
* @property {string} name
* @property {string} location
* @property {number} [signatureLength]
* @property {string} [byteRangePlaceholder]
* @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
* @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
*/

/**
 * Adds a signature placeholder to a PDF-LIB PDFDocument.
 *
 * Alters the passed pdfDoc and returns void.
 *
 * @param {InputType}
 * @returns {void}
 */
const pdflibAddPlaceholder = ({
  pdfDoc,
  reason,
  contactInfo,
  name,
  location,
  signatureLength = _utils.DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = _utils.DEFAULT_BYTE_RANGE_PLACEHOLDER,
  subFilter = _utils.SUBFILTER_ADOBE_PKCS7_DETACHED,
  widgetRect = [0, 0, 0, 0]
}) => {
  const page = pdfDoc.getPage(0);

  // Create a placeholder where the the last 3 parameters of the
  // actual range will be replaced when signing is done.
  const byteRange = _pdfLib.PDFArray.withContext(pdfDoc.context);
  byteRange.push(_pdfLib.PDFNumber.of(0));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));

  // Fill the contents of the placeholder with 00s.
  const placeholder = _pdfLib.PDFHexString.of(String.fromCharCode(0).repeat(signatureLength));

  // Create a signature dictionary to be referenced in the signature widget.
  const signatureDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: subFilter,
    ByteRange: byteRange,
    Contents: placeholder,
    Reason: _pdfLib.PDFString.of(reason),
    M: _pdfLib.PDFString.fromDate(new Date()),
    ContactInfo: _pdfLib.PDFString.of(contactInfo),
    Name: _pdfLib.PDFString.of(name),
    Location: _pdfLib.PDFString.of(location)
  }, pdfDoc.index);
  const signatureDictRef = pdfDoc.context.register(signatureDict);

  // Create the signature widget
  const rect = _pdfLib.PDFArray.withContext(pdfDoc.context);
  widgetRect.forEach(c => rect.push(_pdfLib.PDFNumber.of(c)));
  const widgetDict = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: rect,
    V: signatureDictRef,
    T: _pdfLib.PDFString.of('Signature1'),
    F: _utils.ANNOTATION_FLAGS.PRINT,
    P: page.ref
  }, pdfDoc.index);
  const widgetDictRef = pdfDoc.context.register(widgetDict);

  // Annotate the widget on the first page
  let annotations = page.node.lookupMaybe(_pdfLib.PDFName.of('Annots'), _pdfLib.PDFArray);
  if (typeof annotations === 'undefined') {
    annotations = pdfDoc.context.obj([]);
  }
  annotations.push(widgetDictRef);
  page.node.set(_pdfLib.PDFName.of('Annots'), annotations);

  // Add an AcroForm or update the existing one
  let acroForm = pdfDoc.catalog.lookupMaybe(_pdfLib.PDFName.of('AcroForm'), _pdfLib.PDFDict);
  if (typeof acroForm === 'undefined') {
    // Need to create a new AcroForm
    acroForm = pdfDoc.context.obj({
      Fields: []
    });
    const acroFormRef = pdfDoc.context.register(acroForm);
    pdfDoc.catalog.set(_pdfLib.PDFName.of('AcroForm'), acroFormRef);
  }

  /**
   * @type {PDFNumber}
   */
  let sigFlags;
  if (acroForm.has(_pdfLib.PDFName.of('SigFlags'))) {
    // Already has some flags, will merge
    sigFlags = acroForm.get(_pdfLib.PDFName.of('SigFlags'));
  } else {
    // Create blank flags
    sigFlags = _pdfLib.PDFNumber.of(0);
  }
  const updatedFlags = _pdfLib.PDFNumber.of(sigFlags.asNumber() | _utils.SIG_FLAGS.SIGNATURES_EXIST | _utils.SIG_FLAGS.APPEND_ONLY);
  acroForm.set(_pdfLib.PDFName.of('SigFlags'), updatedFlags);
  const fields = acroForm.get(_pdfLib.PDFName.of('Fields'));
  fields.push(widgetDictRef);
};
exports.pdflibAddPlaceholder = pdflibAddPlaceholder;