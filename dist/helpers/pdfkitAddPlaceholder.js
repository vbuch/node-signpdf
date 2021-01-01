"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _const = require("./const");

var _pdfkitReferenceMock = _interopRequireDefault(require("./pdfkitReferenceMock"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line import/no-unresolved

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
  pdfBuffer,
  reason,
  contactInfo = 'emailfromp1289@gmail.com',
  name = 'Name from p12',
  location = 'Location from p12',
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
    M: new Date(),
    ContactInfo: new String(contactInfo),
    // eslint-disable-line no-new-wrappers
    Name: new String(name),
    // eslint-disable-line no-new-wrappers
    Location: new String(location) // eslint-disable-line no-new-wrappers

  }); // Check if pdf already contains acroform field

  const isAcroFormExists = !!pdf._acroform;

  if (!isAcroFormExists) {
    pdf.initForm();
    pdf._root.data.AcroForm.data.SigFlags = 3;
  }

  const numFields = pdf._root.data.AcroForm.data.Fields.length;
  const signatureName = 'Signature'; // Generate signature annotation widget

  pdf.formAnnotation(signatureName + (numFields + 1), null, 0, 0, 0, 0, {
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: [0, 0, 0, 0],
    V: signature,
    F: 4,
    P: pdf.page.dictionary // eslint-disable-line no-underscore-dangle

  });
  return {
    signature
  };
  /* eslint-enable no-underscore-dangle,no-param-reassign */
};

var _default = pdfkitAddPlaceholder;
exports.default = _default;