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
 * @typedef {import('pdf-lib').PDFPage} PDFPage
 */

/**
 * @typedef {object} CommonInputType
 * @property {PDFDocument} [pdfDoc]
 * @property {PDFPage} [pdfPage]
 * @property {string} reason
 * @property {string} contactInfo
 * @property {string} name
 * @property {string} location
 * @property {Date} [signingTime]
 * @property {number} [signatureLength]
 * @property {string} [byteRangePlaceholder]
 * @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
 * @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
 * @property {string} [appName] Name of the application generating the signature
 */

/**
* @typedef {object} DocInputType
* @property {PDFDocument} pdfDoc
*/

/**
* @typedef {object} PageInputType
* @property {PDFPage} pdfPage
*/

/**
* @typedef {CommonInputType & (DocInputType | PageInputType)} InputType
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
  pdfDoc = undefined,
  pdfPage = undefined,
  reason,
  contactInfo,
  name,
  location,
  signingTime = undefined,
  signatureLength = _utils.DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = _utils.DEFAULT_BYTE_RANGE_PLACEHOLDER,
  subFilter = _utils.SUBFILTER_ADOBE_PKCS7_DETACHED,
  widgetRect = [0, 0, 0, 0],
  appName = undefined
}) => {
  if (pdfDoc === undefined && pdfPage === undefined) {
    throw new _utils.SignPdfError('PDFDoc or PDFPage must be set.', _utils.SignPdfError.TYPE_INPUT);
  }
  const doc = pdfDoc !== null && pdfDoc !== void 0 ? pdfDoc : pdfPage.doc;
  const page = pdfPage !== null && pdfPage !== void 0 ? pdfPage : doc.getPages()[0];

  // Create a placeholder where the the last 3 parameters of the
  // actual range will be replaced when signing is done.
  const byteRange = _pdfLib.PDFArray.withContext(doc.context);
  byteRange.push(_pdfLib.PDFNumber.of(0));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  byteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));

  // Fill the contents of the placeholder with 00s.
  const placeholder = _pdfLib.PDFHexString.of(String.fromCharCode(0).repeat(signatureLength));

  // Create a signature dictionary to be referenced in the signature widget.
  const appBuild = appName ? {
    App: {
      Name: appName
    }
  } : {};
  const signatureDict = doc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: subFilter,
    ByteRange: byteRange,
    Contents: placeholder,
    Reason: _pdfLib.PDFString.of(reason),
    M: _pdfLib.PDFString.fromDate(signingTime !== null && signingTime !== void 0 ? signingTime : new Date()),
    ContactInfo: _pdfLib.PDFString.of(contactInfo),
    Name: _pdfLib.PDFString.of(name),
    Location: _pdfLib.PDFString.of(location),
    Prop_Build: {
      Filter: {
        Name: 'Adobe.PPKLite'
      },
      ...appBuild
    }
  });
  // Register signatureDict as a PDFInvalidObject to prevent PDFLib from serializing it
  // in an object stream.
  const signatureBuffer = new Uint8Array(signatureDict.sizeInBytes());
  signatureDict.copyBytesInto(signatureBuffer, 0);
  const signatureObj = _pdfLib.PDFInvalidObject.of(signatureBuffer);
  const signatureDictRef = doc.context.register(signatureObj);

  // Create the signature widget
  const rect = _pdfLib.PDFArray.withContext(doc.context);
  widgetRect.forEach(c => rect.push(_pdfLib.PDFNumber.of(c)));
  const apStream = doc.context.formXObject([], {
    BBox: widgetRect,
    Resources: {} // Necessary to avoid Acrobat bug (see https://stackoverflow.com/a/73011571)
  });

  const widgetDict = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: rect,
    V: signatureDictRef,
    T: _pdfLib.PDFString.of('Signature1'),
    F: _utils.ANNOTATION_FLAGS.PRINT,
    P: page.ref,
    AP: {
      N: doc.context.register(apStream)
    } // Required for PDF/A compliance
  });

  const widgetDictRef = doc.context.register(widgetDict);

  // Annotate the widget on the given page
  let annotations = page.node.lookupMaybe(_pdfLib.PDFName.of('Annots'), _pdfLib.PDFArray);
  if (typeof annotations === 'undefined') {
    annotations = doc.context.obj([]);
  }
  annotations.push(widgetDictRef);
  page.node.set(_pdfLib.PDFName.of('Annots'), annotations);

  // Add an AcroForm or update the existing one
  let acroForm = doc.catalog.lookupMaybe(_pdfLib.PDFName.of('AcroForm'), _pdfLib.PDFDict);
  if (typeof acroForm === 'undefined') {
    // Need to create a new AcroForm
    acroForm = doc.context.obj({
      Fields: []
    });
    const acroFormRef = doc.context.register(acroForm);
    doc.catalog.set(_pdfLib.PDFName.of('AcroForm'), acroFormRef);
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