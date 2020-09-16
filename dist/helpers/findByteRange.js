"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SignPdfError = _interopRequireDefault(require("../SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds the ByteRange within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {Object} {byteRangeString: String, byteRange: String[]}
 */
const findByteRange = pdf => {
  if (!(pdf instanceof Buffer)) {
    throw new _SignPdfError.default('PDF expected as Buffer.', _SignPdfError.default.TYPE_INPUT);
  }

  const byteRangeMatch = /\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*\]{1}/g.exec(pdf);

  if (!byteRangeMatch) {
    throw new _SignPdfError.default('No ByteRangeString found within PDF buffer', _SignPdfError.default.TYPE_PARSE);
  }

  const byteRangeString = byteRangeMatch[0];
  const byteRange = byteRangeString.match(/[^\[\s]*(?:\d|\/\*{10})/g);
  return {
    byteRangeString,
    byteRange
  };
};

var _default = findByteRange;
exports.default = _default;