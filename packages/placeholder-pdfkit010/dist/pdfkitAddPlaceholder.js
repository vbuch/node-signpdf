"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pdfkitAddPlaceholder = void 0;
var _utils = require("@signpdf/utils");
/**
* @typedef {object} InputType
* @property {object} pdf PDFDocument
* @property {Buffer} pdfBuffer
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
* @typedef {object} ReturnType
* @property {any} signature
* @property {any} form
* @property {any} widget
 */

/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {InputType}
 * @returns {ReturnType}
 */
const pdfkitAddPlaceholder = ({
  pdf,
  pdfBuffer,
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
  /* eslint-disable no-underscore-dangle,no-param-reassign */
  // Generate the signature placeholder
  const signature = pdf.ref({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: subFilter,
    ByteRange: [0, byteRangePlaceholder, byteRangePlaceholder, byteRangePlaceholder],
    Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
    Reason: new String(reason),
    // eslint-disable-line no-new-wrappers
    M: signingTime !== null && signingTime !== void 0 ? signingTime : new Date(),
    ContactInfo: new String(contactInfo),
    // eslint-disable-line no-new-wrappers
    Name: new String(name),
    // eslint-disable-line no-new-wrappers
    Location: new String(location),
    // eslint-disable-line no-new-wrappers
    Prop_Build: {
      Filter: {
        Name: 'Adobe.PPKLite'
      },
      ...(appName ? {
        App: {
          Name: appName
        }
      } : {})
    }
  });

  // Check if pdf already contains acroform field
  const isAcroFormExists = typeof pdf._root.data.AcroForm !== 'undefined';
  let fieldIds = [];
  let acroFormId;
  if (isAcroFormExists) {
    /* FIXME: We're working with a PDFDocument.
     * Needing to work with strings here doesn't make sense.
     * It only exists to support plainAddPlaceholder the reference to /AcroForm
     * would be external to PDFKit at this point.
     */

    const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm');
    let acroFormStart = acroFormPosition;
    // 10 is the distance between "/Type /AcroForm" and AcroFrom ID
    const charsUntilIdEnd = 10;
    const acroFormIdEnd = acroFormPosition - charsUntilIdEnd;
    // Let's find AcroForm ID by trying to find the "\n" before the ID
    // 12 is a enough space to find the "\n"
    // (generally it's 2 or 3, but I'm giving a big space though)
    const maxAcroFormIdLength = 12;
    let index = charsUntilIdEnd + 1;
    for (index; index < charsUntilIdEnd + maxAcroFormIdLength; index += 1) {
      const acroFormIdString = pdfBuffer.slice(acroFormPosition - index, acroFormIdEnd).toString();
      if (acroFormIdString[0] === '\n') {
        break;
      }
      acroFormStart = acroFormPosition - index;
    }
    const pdfSlice = pdfBuffer.slice(acroFormStart);
    const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString();
    acroFormId = parseInt(pdf._root.data.AcroForm.toString());
    const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'));
    fieldIds = acroFormFields.split(' ').filter(Boolean).filter((element, i) => i % 3 === 0).map(fieldId => new _utils.PDFKitReferenceMock(fieldId));
  }
  const signatureName = 'Signature';

  // Generate signature annotation widget
  const widget = pdf.ref({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: widgetRect,
    V: signature,
    T: new String(signatureName + (fieldIds.length + 1)),
    // eslint-disable-line no-new-wrappers
    F: _utils.ANNOTATION_FLAGS.PRINT,
    P: pdf.page.dictionary // eslint-disable-line no-underscore-dangle
  });

  pdf.page.dictionary.data.Annots = [widget];
  // Include the widget in a page
  let form;
  if (!isAcroFormExists) {
    // Create a form (with the widget) and link in the _root
    form = pdf.ref({
      Type: 'AcroForm',
      SigFlags: _utils.SIG_FLAGS.SIGNATURES_EXIST | _utils.SIG_FLAGS.APPEND_ONLY,
      Fields: [...fieldIds, widget]
    });
  } else {
    // Use existing acroform and extend the fields with newly created widgets
    form = pdf.ref({
      Type: 'AcroForm',
      SigFlags: _utils.SIG_FLAGS.SIGNATURES_EXIST | _utils.SIG_FLAGS.APPEND_ONLY,
      Fields: [...fieldIds, widget]
    }, acroFormId);
  }
  pdf._root.data.AcroForm = form;
  return {
    signature,
    form,
    widget
  };
  /* eslint-enable no-underscore-dangle,no-param-reassign */
};
exports.pdfkitAddPlaceholder = pdfkitAddPlaceholder;