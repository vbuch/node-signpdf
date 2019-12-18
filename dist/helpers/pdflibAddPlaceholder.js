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
  signatureLength = signatureLength * 2;
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

  const date = new Date();

  const arrayByteRange = _pdfLib.PDFArray.withContext(pdfDoc.context);

  arrayByteRange.push(_pdfLib.PDFNumber.of(0));
  arrayByteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  arrayByteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  arrayByteRange.push(_pdfLib.PDFName.of(byteRangePlaceholder));
  const signatureDictMap = new Map();
  signatureDictMap.set(_pdfLib.PDFName.Type, _pdfLib.PDFName.of('Sig'));
  signatureDictMap.set(_pdfLib.PDFName.of('Filter'), _pdfLib.PDFName.of('Adobe.PPKLite'));
  signatureDictMap.set(_pdfLib.PDFName.of('SubFilter'), _pdfLib.PDFName.of('adbe.pkcs7.detached'));
  signatureDictMap.set(_pdfLib.PDFName.of('ByteRange'), arrayByteRange);
  signatureDictMap.set(_pdfLib.PDFName.of('Contents'), _pdfLib.PDFHexString.of('0'.repeat(signatureLength)));
  signatureDictMap.set(_pdfLib.PDFName.of('Reason'), _pdfLib.PDFString.of(infoSignature.reason));
  signatureDictMap.set(_pdfLib.PDFName.of('M'), _pdfLib.PDFString.fromDate(date));
  signatureDictMap.set(_pdfLib.PDFName.of('ContactInfo'), _pdfLib.PDFString.of(infoSignature.contactInfo || ''));
  signatureDictMap.set(_pdfLib.PDFName.of('Name'), _pdfLib.PDFString.of(infoSignature.name || ''));
  signatureDictMap.set(_pdfLib.PDFName.of('Location'), _pdfLib.PDFString.of(infoSignature.location || ''));

  const signatureDict = _pdfLib.PDFDict.fromMapWithContext(signatureDictMap, pdfDoc.context); // Check if pdf already contains acroform field


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
  }

  const sigAppearanceStreamMapDict = new Map(); // const FontHelvetica = pdfDoc.embedStandardFont(StandardFonts.Helvetica)
  // const resourcesMap = new Map()
  // const fontMap = new Map()
  // fontMap.set(PDFName.of('Helvetica'), FontHelvetica)
  // resourcesMap.set(PDFName.Font, PDFDict.fromMapWithContext(fontMap, pdfDoc.context))
  // sigAppearanceStreamMapDict.set(
  //   PDFName.of('Resources'),
  //   PDFDict.fromMapWithContext(resourcesMap, pdfDoc.context)
  // )

  sigAppearanceStreamMapDict.set(_pdfLib.PDFName.Type, _pdfLib.PDFName.XObject);
  sigAppearanceStreamMapDict.set(_pdfLib.PDFName.of('Subtype'), _pdfLib.PDFName.of('Form')); // Define a content stream that defines how the signature field should appear
  // on the PDF. - Table 95 of the PDF specification.

  const sigAppearanceStream = _pdfLib.PDFContentStream.of(_pdfLib.PDFDict.fromMapWithContext(sigAppearanceStreamMapDict, pdfDoc.context), (0, _pdfLib.drawRectangle)({
    x: _pdfLib.PDFNumber.of(infoSignature.positionBBox.left),
    y: _pdfLib.PDFNumber.of(infoSignature.positionBBox.bottom),
    width: _pdfLib.PDFNumber.of(infoSignature.positionBBox.right),
    height: _pdfLib.PDFNumber.of(infoSignature.positionBBox.top),
    color: (0, _pdfLib.rgb)(0.95, 0.95, 0.95),
    borderWidth: 3,
    borderColor: (0, _pdfLib.rgb)(0, 0, 0),
    rotate: (0, _pdfLib.degrees)(0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  }));

  (0, _pdfLib.drawText)(info, {
    x: _pdfLib.PDFNumber.of(10),
    y: _pdfLib.PDFNumber.of(15),
    font: 'Helvetica',
    size: _pdfLib.PDFNumber.of(15),
    color: (0, _pdfLib.rgb)(0.5, 0.5, 0.5),
    rotate: (0, _pdfLib.degrees)(0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  }).forEach(x => {
    sigAppearanceStream.push(x);
  });
  (0, _pdfLib.drawRectangle)({
    x: _pdfLib.PDFNumber.of(4),
    y: _pdfLib.PDFNumber.of(4),
    width: _pdfLib.PDFNumber.of(192),
    height: _pdfLib.PDFNumber.of(2),
    color: (0, _pdfLib.rgb)(0.5, 0.5, 0.5),
    rotate: (0, _pdfLib.degrees)(0),
    borderWidth: 0,
    borderColor: (0, _pdfLib.rgb)(0, 0, 0),
    xSkew: (0, _pdfLib.degrees)(0),
    ySkew: (0, _pdfLib.degrees)(0)
  }).forEach(x => {
    sigAppearanceStream.push(x);
  });
  const sigAppearanceStreamRef = pdfDoc.context.register(sigAppearanceStream); // Define the signature widget annotation - Table 164

  const widgetDictMap = new Map();
  const APMap = new Map();

  const arrayRect = _pdfLib.PDFArray.withContext(pdfDoc.context);

  arrayRect.push(_pdfLib.PDFNumber.of(50));
  arrayRect.push(_pdfLib.PDFNumber.of(50));
  arrayRect.push(_pdfLib.PDFNumber.of(300));
  arrayRect.push(_pdfLib.PDFNumber.of(100));
  APMap.set(_pdfLib.PDFName.of('N'), sigAppearanceStreamRef);
  widgetDictMap.set(_pdfLib.PDFName.Type, _pdfLib.PDFName.of('Annot'));
  widgetDictMap.set(_pdfLib.PDFName.of('Subtype'), _pdfLib.PDFName.of('Widget'));
  widgetDictMap.set(_pdfLib.PDFName.of('FT'), _pdfLib.PDFName.of('Sig'));
  widgetDictMap.set(_pdfLib.PDFName.of('Rect'), arrayRect);
  widgetDictMap.set(_pdfLib.PDFName.of('V'), signatureDict);
  widgetDictMap.set(_pdfLib.PDFName.of('T'), _pdfLib.PDFString.of(signatureName + (fieldIds.length + 1)));
  widgetDictMap.set(_pdfLib.PDFName.of('F'), _pdfLib.PDFNumber.of(4));
  widgetDictMap.set(_pdfLib.PDFName.of('P'), pdfDoc.catalog.Pages().Kids().get(0));
  widgetDictMap.set(_pdfLib.PDFName.of('AP'), _pdfLib.PDFDict.fromMapWithContext(APMap, pdfDoc.context));

  const widgetDict = _pdfLib.PDFDict.fromMapWithContext(widgetDictMap, pdfDoc.context);

  const widgetDictRef = pdfDoc.context.register(widgetDict); // Add our signature widget to the first page
  // by parameter it should also be sent which pages you want to sign - ojo

  const pages = pdfDoc.getPages();

  const arrayAnnots = _pdfLib.PDFArray.withContext(pdfDoc.context);

  arrayAnnots.push(widgetDictRef);
  pages[0].node.set(_pdfLib.PDFName.Annots, arrayAnnots); // Create an AcroForm object containing our signature widget

  const formDictMap = new Map();

  const arrayFields = _pdfLib.PDFArray.withContext(pdfDoc.context);

  arrayFields.push(widgetDictRef);
  formDictMap.set(_pdfLib.PDFName.of('SigFlags'), _pdfLib.PDFNumber.of(3));
  formDictMap.set(_pdfLib.PDFName.of('Fields'), arrayFields);

  const formDict = _pdfLib.PDFDict.fromMapWithContext(formDictMap, pdfDoc.context);

  pdfDoc.catalog.set(_pdfLib.PDFName.of('AcroForm'), formDict);
  let pdfDocBytes = await _pdfLib.PDFWriter.forContext(pdfDoc.context).serializeToBuffer(); // Delete spaces in ByteRange

  pdfDocBytes = Buffer.from(pdfDocBytes);
  const byteRangePlaceholderContent = [0, `/${byteRangePlaceholder}`, `/${byteRangePlaceholder}`, `/${byteRangePlaceholder}`];
  const byteRangeString = `/ByteRange [ ${byteRangePlaceholderContent.join(' ')} ]`;
  let actualByteRange = `/ByteRange [${byteRangePlaceholderContent.join(' ')}]`;
  actualByteRange += '  ';
  const byteRangePos = pdfDocBytes.indexOf(byteRangeString);

  if (byteRangePos !== -1) {
    const byteRangeEnd = byteRangePos + byteRangeString.length;
    pdfDocBytes = Buffer.concat([pdfDocBytes.slice(0, byteRangePos), Buffer.from(actualByteRange), pdfDocBytes.slice(byteRangeEnd)]);
  }

  return Buffer.from(pdfDocBytes);
};

var _default = pdflibAddPlaceholder;
exports.default = _default;