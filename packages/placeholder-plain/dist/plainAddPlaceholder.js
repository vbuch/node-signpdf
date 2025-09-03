"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.plainAddPlaceholder = void 0;
var _placeholderPdfkit = require("@signpdf/placeholder-pdfkit010");
var _utils = require("@signpdf/utils");
var _getIndexFromRef = _interopRequireDefault(require("./getIndexFromRef"));
var _readPdf = _interopRequireDefault(require("./readPdf"));
var _getPageRef = _interopRequireDefault(require("./getPageRef"));
var _createBufferRootWithAcroform = _interopRequireDefault(require("./createBufferRootWithAcroform"));
var _createBufferPageWithAnnotation = _interopRequireDefault(require("./createBufferPageWithAnnotation"));
var _createBufferTrailer = _interopRequireDefault(require("./createBufferTrailer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable no-underscore-dangle */

/**
 * @param {string} pdf
 * @returns {string | undefined}
 */
const getAcroFormRef = slice => {
  const bufferRootWithAcroformRefRegex = /\/AcroForm\s+(\d+\s\d+\sR)/g;
  const match = bufferRootWithAcroformRefRegex.exec(slice);
  if (match != null && match[1] != null && match[1] !== '') {
    return match[1];
  }
  return undefined;
};

/**
* @typedef {object} InputType
* @property {Buffer} pdfBuffer
* @property {string} reason
* @property {string} contactInfo
* @property {string} name
* @property {string} location
* @property {Date} [signingTime]
* @property {number} [signatureLength]
* @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
* @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
* @property {string} [appName] Name of the application generating the signature
*/

/**
 * Adds a signature placeholder to a PDF Buffer.
 *
 * This contrasts with the default pdfkit-based implementation.
 * Parsing is done using simple string operations.
 * Adding is done with `Buffer.concat`.
 * This allows node-signpdf to be used on any PDF and
 * not only on a freshly created through PDFKit one.
 *
 * @param {InputType}
 * @returns {Buffer}
 */
const plainAddPlaceholder = ({
  pdfBuffer,
  reason,
  contactInfo,
  name,
  location,
  signingTime = undefined,
  signatureLength = _utils.DEFAULT_SIGNATURE_LENGTH,
  subFilter = _utils.SUBFILTER_ADOBE_PKCS7_DETACHED,
  widgetRect = [0, 0, 0, 0],
  appName = undefined
}) => {
  let pdf = (0, _utils.removeTrailingNewLine)(pdfBuffer);
  const info = (0, _readPdf.default)(pdf);
  const pageRef = (0, _getPageRef.default)(pdf, info);
  const pageIndex = (0, _getIndexFromRef.default)(info.xref, pageRef);
  const addedReferences = new Map();
  const pdfKitMock = {
    ref: (input, knownIndex) => {
      info.xref.maxIndex += 1;
      const index = knownIndex != null ? knownIndex : info.xref.maxIndex;
      addedReferences.set(index, pdf.length + 1); // + 1 new line

      pdf = Buffer.concat([pdf, Buffer.from('\n'), Buffer.from(`${index} 0 obj\n`), Buffer.from(_utils.PDFObject.convert(input)), Buffer.from('\nendobj\n')]);
      return new _utils.PDFKitReferenceMock(info.xref.maxIndex);
    },
    page: {
      dictionary: new _utils.PDFKitReferenceMock(pageIndex, {
        data: {
          Annots: []
        }
      })
    },
    _root: {
      data: {}
    }
  };
  const acroFormRef = getAcroFormRef(info.root);
  if (acroFormRef) {
    pdfKitMock._root.data.AcroForm = acroFormRef;
  }
  const {
    form,
    widget
  } = (0, _placeholderPdfkit.pdfkitAddPlaceholder)({
    pdf: pdfKitMock,
    pdfBuffer,
    reason,
    contactInfo,
    name,
    location,
    signingTime,
    signatureLength,
    subFilter,
    widgetRect,
    appName
  });
  if (!getAcroFormRef(pdf.toString())) {
    const rootIndex = (0, _getIndexFromRef.default)(info.xref, info.rootRef);
    addedReferences.set(rootIndex, pdf.length + 1);
    pdf = Buffer.concat([pdf, Buffer.from('\n'), (0, _createBufferRootWithAcroform.default)(pdf, info, form)]);
  }
  addedReferences.set(pageIndex, pdf.length + 1);
  pdf = Buffer.concat([pdf, Buffer.from('\n'), (0, _createBufferPageWithAnnotation.default)(pdf, info, pageRef, widget)]);
  pdf = Buffer.concat([pdf, Buffer.from('\n'), (0, _createBufferTrailer.default)(pdf, info, addedReferences)]);
  return pdf;
};
exports.plainAddPlaceholder = plainAddPlaceholder;