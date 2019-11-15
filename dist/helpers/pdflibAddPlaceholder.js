"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pdfkitReferenceMock = _interopRequireDefault(require("./pdfkitReferenceMock"));

var _const = require("./const");

var _pdfLib = require("pdf-lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pdflibAddPlaceholder = async ({
  pdfBuffer,
  infoSignature,
  signatureLength = _const.DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = _const.DEFAULT_BYTE_RANGE_PLACEHOLDER
}) => {
  let pdfDoc;

  try {
    pdfBuffer = pdfBuffer.toString('base64');
    pdfDoc = await _pdfLib.PDFDocument.load(pdfBuffer);
  } catch (err) {
    if (err.message.includes('encrypted')) {
      throw new SignPdfError('Problem loading PDF, PDF encrypted', SignPdfError.TYPE_PARSE);
    } else {
      throw err;
    }
  }

  const FontHelvetica = pdfDoc.embedStandardFont('Helvetica');
  const date = new Date();

  const pad = (str, length) => (Array(length + 1).join('0') + str).slice(-length);

  const dateString = `D:${pad(date.getUTCFullYear(), 4)}` + pad(date.getUTCMonth() + 1, 2) + pad(date.getUTCDate(), 2) + pad(date.getUTCHours(), 2) + pad(date.getUTCMinutes(), 2) + pad(date.getUTCSeconds(), 2) + 'Z'; // Table 252 of the PDF specification.

  const signatureDict = _pdfLib.PDFDict.withContext({
    Type: _pdfLib.PDFName.of('Sig'),
    Filter: _pdfLib.PDFName.of('Adobe.PPKLite'),
    SubFilter: _pdfLib.PDFName.of('adbe.pkcs7.detached'),
    ByteRange: _pdfLib.PDFArray.withContext([_pdfLib.PDFNumber.of(0), _pdfLib.PDFNumber.of(byteRangePlaceholder), _pdfLib.PDFNumber.of(byteRangePlaceholder), _pdfLib.PDFNumber.of(byteRangePlaceholder)], pdfDoc.context),
    Contents: _pdfLib.PDFHexString.of(String.fromCharCode(0).repeat(signatureLength)),
    Reason: _pdfLib.PDFString.of(infoSignature.reason),
    M: _pdfLib.PDFString.of(dateString),
    ContactInfo: _pdfLib.PDFString.of(infoSignature.contactInfo || ''),
    Name: _pdfLib.PDFString.of(infoSignature.name || ''),
    Location: _pdfLib.PDFString.of(infoSignature.location || '')
  }, pdfDoc.context); // Check if pdf already contains acroform field


  const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm');
  const isAcroFormExists = acroFormPosition !== -1;
  let fieldIds = [];
  let acroFormId;

  if (isAcroFormExists) {
    const pdfSlice = pdfBuffer.slice(acroFormPosition - 12);
    const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString();
    const acroFormFirsRow = acroForm.split('\n')[0];
    acroFormId = parseInt(acroFormFirsRow.split(' ')[0]);
    const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'));
    fieldIds = acroFormFields.split(' ').filter((element, index) => index % 3 === 0).map(fieldId => new _pdfkitReferenceMock.default(fieldId));
  }

  const signatureName = 'Signature';
  const info = (infoSignature.name || 'Signed') + '\n' + date.toISOString();

  if (!infoSignature.positionBBox || !infoSignature.positionBBox.left || !infoSignature.positionBBox.bottom || !infoSignature.positionBBox.right || !infoSignature.positionBBox.top) {
    infoSignature.positionBBox = {
      left: 0,
      bottom: 0,
      right: 200,
      top: 50
    };
  } // Define a content stream that defines how the signature field should appear
  // on the PDF. - Table 95 of the PDF specification.


  const sigAppearanceStream = _pdfLib.PDFContentStream.of(_pdfLib.PDFDict.withContext({
    Type: _pdfLib.PDFName.of('XObject'),
    Subtype: _pdfLib.PDFName.of('Form'),
    BBox: _pdfLib.PDFArray.withContext([_pdfLib.PDFNumber.of(infoSignature.positionBBox.left), _pdfLib.PDFNumber.of(infoSignature.positionBBox.bottom), _pdfLib.PDFNumber.of(infoSignature.positionBBox.right), _pdfLib.PDFNumber.of(infoSignature.positionBBox.top)], pdfDoc.context),
    Resources: _pdfLib.PDFDict.withContext({
      Font: _pdfLib.PDFDict.withContext({
        Helvetica: FontHelvetica
      }, pdfDoc.context)
    }, pdfDoc.context)
  }, pdfDoc.context), (0, _pdfLib.drawRectangle)({
    x: infoSignature.positionBBox.left,
    y: infoSignature.positionBBox.bottom,
    width: infoSignature.positionBBox.right,
    height: infoSignature.positionBBox.top,
    color: (0, _pdfLib.rgb)(0.95, 0.95, 0.95),
    borderWidth: 3,
    borderColor: (0, _pdfLib.rgb)(0, 0, 0),
    rotate: (0, _pdfLib.degrees)(0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  }), (0, _pdfLib.drawText)(info, {
    x: 10,
    y: 15,
    font: 'Helvetica',
    size: 15,
    color: (0, _pdfLib.rgb)(0.5, 0.5, 0.5),
    rotate: (0, _pdfLib.degrees)(0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  }), (0, _pdfLib.drawRectangle)({
    x: 4,
    y: 4,
    width: 192,
    height: 2,
    color: (0, _pdfLib.rgb)(0.5, 0.5, 0.5),
    rotate: (0, _pdfLib.degrees)(0),
    borderWidth: 0,
    borderColor: (0, _pdfLib.rgb)(0, 0, 0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  })); // Similar Function is PDFContext.register, but it doesn't work


  const sigAppearanceStreamRef = pdfDoc.register(sigAppearanceStream); // Define the signature widget annotation

  const widgetDict = _pdfLib.PDFDict.withContext({
    Type: _pdfLib.PDFName.of('Annot'),
    Subtype: _pdfLib.PDFName.of('Widget'),
    FT: _pdfLib.PDFName.of('Sig'),
    Rect: _pdfLib.PDFArray.withContext([_pdfLib.PDFNumber.of(50), _pdfLib.PDFNumber.of(50), _pdfLib.PDFNumber.of(300), _pdfLib.PDFNumber.of(100)], pdfDoc.context),
    V: signatureDict,
    T: _pdfLib.PDFString.of(signatureName + (fieldIds.length + 1)),
    F: _pdfLib.PDFNumber.of(4),
    // P: (pdfDoc.catalog.Pages.get('Kids') as PDFArray).get(0),
    AP: _pdfLib.PDFDict.withContext({
      N: sigAppearanceStreamRef
    }, pdfDoc.context)
  }, pdfDoc.context); // Similar Function is PDFContext.register, but it doesn't work


  const widgetDictRef = pdfDoc.register(widgetDict); // Add our signature widget to the first page
  // by parameter it should also be sent which pages you want to sign - ojo

  const pages = pdfDoc.getPages();
  pages[0].set('Annots', _pdfLib.PDFArray.withContext([widgetDictRef], pdfDoc.context)); // Create an AcroForm object containing our signature widget

  const formDict = _pdfLib.PDFDict.withContext({
    SigFlags: _pdfLib.PDFNumber.of(3),
    Fields: _pdfLib.PDFArray.withContext([widgetDictRef], pdfDoc.context)
  }, pdfDoc.context);

  pdfDoc.catalog.set('AcroForm', formDict);
  return Buffer.from(pdfDoc);
};

var _default = pdflibAddPlaceholder;
exports.default = _default;