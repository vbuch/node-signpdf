"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DEFAULT_BYTE_RANGE_PLACEHOLDER: true,
  SignPdf: true,
  SignPdfError: true
};
Object.defineProperty(exports, "SignPdfError", {
  enumerable: true,
  get: function () {
    return _SignPdfError.default;
  }
});
exports.default = exports.SignPdf = exports.DEFAULT_BYTE_RANGE_PLACEHOLDER = void 0;

var _SignPdfError = _interopRequireDefault(require("./SignPdfError"));

var _helpers = require("./helpers");

Object.keys(_helpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _helpers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _helpers[key];
    }
  });
});

var _signer = _interopRequireDefault(require("./signer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
exports.DEFAULT_BYTE_RANGE_PLACEHOLDER = DEFAULT_BYTE_RANGE_PLACEHOLDER;

class SignPdf {
  constructor() {
    this.byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER;
    this.lastSignature = null;
  }
  /**
   * Sign a PDF buffer with given signer
   *
   * @param {Buffer} pdfBuffer
   * @param {Signer} signer
   * @returns {Promise<Buffer>}
   */


  async sign(pdfBuffer, signer) {
    if (!(pdfBuffer instanceof Buffer)) {
      throw new _SignPdfError.default('PDF expected as Buffer.', _SignPdfError.default.TYPE_INPUT);
    }

    if (!(signer instanceof _signer.default)) {
      throw new _SignPdfError.default('signer must be a Signer class', _SignPdfError.default.TYPE_INPUT);
    }

    let pdf = (0, _helpers.removeTrailingNewLine)(pdfBuffer); // Find the ByteRange placeholder.

    const {
      byteRangePlaceholder
    } = (0, _helpers.findByteRange)(pdf);

    if (!byteRangePlaceholder) {
      throw new _SignPdfError.default(`Could not find empty ByteRange placeholder: ${byteRangePlaceholder}`, _SignPdfError.default.TYPE_PARSE);
    }

    const byteRangePos = pdf.indexOf(byteRangePlaceholder); // Calculate the actual ByteRange that needs to replace the placeholder.

    const byteRangeEnd = byteRangePos + byteRangePlaceholder.length;
    const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd);
    const placeholderPos = pdf.indexOf('<', contentsTagPos);
    const placeholderEnd = pdf.indexOf('>', placeholderPos);
    const placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos;
    const placeholderLength = placeholderLengthWithBrackets - 2;
    const byteRange = [0, 0, 0, 0];
    byteRange[1] = placeholderPos;
    byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
    byteRange[3] = pdf.length - byteRange[2];
    let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
    actualByteRange += ' '.repeat(byteRangePlaceholder.length - actualByteRange.length); // Replace the /ByteRange placeholder with the actual ByteRange

    pdf = Buffer.concat([pdf.slice(0, byteRangePos), Buffer.from(actualByteRange), pdf.slice(byteRangeEnd)]); // Remove the placeholder signature

    pdf = Buffer.concat([pdf.slice(0, byteRange[1]), pdf.slice(byteRange[2], byteRange[2] + byteRange[3])]); // signing

    const raw = await signer.sign(pdf); // Check if the PDF has a good enough placeholder to fit the signature.
    // placeholderLength represents the length of the HEXified symbols but we're
    // checking the actual lengths.

    if (raw.length * 2 > placeholderLength) {
      throw new _SignPdfError.default(`Signature exceeds placeholder length: ${raw.length * 2} > ${placeholderLength}`, _SignPdfError.default.TYPE_INPUT);
    }

    let signature = Buffer.from(raw, 'binary').toString('hex'); // Store the HEXified signature. At least useful in tests.

    this.lastSignature = signature; // Pad the signature with zeroes so the it is the same length as the placeholder

    signature += Buffer.from(String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length)).toString('hex'); // Place it in the document.

    pdf = Buffer.concat([pdf.slice(0, byteRange[1]), Buffer.from(`<${signature}>`), pdf.slice(byteRange[1])]); // Magic. Done.

    return pdf;
  }

}

exports.SignPdf = SignPdf;

var _default = new SignPdf();

exports.default = _default;