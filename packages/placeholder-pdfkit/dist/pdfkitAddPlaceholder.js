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
  if (!pdf._acroform) {
    pdf.initForm();
  }
  const form = pdf._root.data.AcroForm;
  const fieldId = form.data.Fields.length + 1;
  const signatureName = `Signature${fieldId}`;
  form.data = {
    Type: 'AcroForm',
    SigFlags: _utils.SIG_FLAGS.SIGNATURES_EXIST | _utils.SIG_FLAGS.APPEND_ONLY,
    Fields: form.data.Fields,
    DR: form.data.DR
  };

  // Generate signature annotation widget
  const widget = pdf.ref({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: widgetRect,
    V: signature,
    T: new String(signatureName),
    // eslint-disable-line no-new-wrappers
    P: pdf.page.dictionary
  });
  pdf.page.annotations.push(widget);
  form.data.Fields.push(widget);
  signature.end();
  widget.end();
  return {
    signature,
    form,
    widget
  };
  /* eslint-enable no-underscore-dangle,no-param-reassign */
};
exports.pdfkitAddPlaceholder = pdfkitAddPlaceholder;