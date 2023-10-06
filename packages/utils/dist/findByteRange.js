"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findByteRange = void 0;
var _SignPdfError = require("./SignPdfError");
var _const = require("./const");
/**
 * Finds ByteRange information within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {Object} {byteRangePlaceholder: String, byteRangeStrings: String[], byteRange: String[]}
 */
const findByteRange = (pdf, placeholder = _const.DEFAULT_BYTE_RANGE_PLACEHOLDER) => {
  if (!(pdf instanceof Buffer)) {
    throw new _SignPdfError.SignPdfError('PDF expected as Buffer.', _SignPdfError.SignPdfError.TYPE_INPUT);
  }
  const byteRangeStrings = pdf.toString().match(/\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*]{1}/g);
  if (!byteRangeStrings) {
    throw new _SignPdfError.SignPdfError('No ByteRangeStrings found within PDF buffer', _SignPdfError.SignPdfError.TYPE_PARSE);
  }
  const byteRangePlaceholder = byteRangeStrings.find(s => s.includes(`/${placeholder}`));
  const byteRanges = byteRangeStrings.map(brs => brs.match(/[^[\s]*(?:\d|\/\*{10})/g));
  return {
    byteRangePlaceholder,
    byteRangeStrings,
    byteRanges
  };
};
exports.findByteRange = findByteRange;