"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pdfLib = require("pdf-lib");

var _SignPdfError = _interopRequireDefault(require("../../SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const addMarkToDocument = async (pdfBuffer, text) => {
  let pdfDoc;

  try {
    pdfBuffer = Buffer.from(pdfBuffer).toString('base64');
    pdfDoc = await _pdfLib.PDFDocument.load(pdfBuffer);
  } catch (err) {
    if (err.message.includes('encrypted')) {
      throw new _SignPdfError.default('Problem loading PDF, PDF encrypted', _SignPdfError.default.TYPE_PARSE);
    } else {
      throw err;
    }
  }

  const pages = pdfDoc.getPages();
  let textForPDF = text.replace(/(?![^\n]{1,30}$)([^\n]{1,30})\s/g, '$1\n');
  textForPDF += `\nDate: ${new Date().toLocaleString()}`;
  const {
    width,
    height
  } = pages[0].getSize();
  const helveticaFont = await pdfDoc.embedFont(_pdfLib.StandardFonts.Helvetica);
  const drawOptions = {
    size: 10,
    lineHeight: 12,
    x: 50,
    y: 50
  };
  pages.forEach(page => {
    page.drawText(textForPDF, drawOptions);
  });
  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};

var _default = addMarkToDocument;
exports.default = _default;