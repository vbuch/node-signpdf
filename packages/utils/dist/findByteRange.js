"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findByteRange = void 0;
var _SignPdfError = require("./SignPdfError");
var _const = require("./const");
/**
* @typedef {object} OutputType
* @property {string | undefined} byteRangePlaceholder
* @property {number | undefined} byteRangePlaceholderPosition
* @property {string[]} byteRangeStrings
* @property {string[]} byteRange
*/

/**
 * Finds ByteRange information within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {OutputType}
 */
const findByteRange = (pdf, placeholder = _const.DEFAULT_BYTE_RANGE_PLACEHOLDER) => {
  if (!(pdf instanceof Buffer)) {
    throw new _SignPdfError.SignPdfError('PDF expected as Buffer.', _SignPdfError.SignPdfError.TYPE_INPUT);
  }
  let byteRangePlaceholder;
  let byteRangePlaceholderPosition;
  const byteRangeStrings = [];
  const byteRanges = [];
  let offset = 0;
  do {
    const position = pdf.indexOf('/ByteRange', offset);
    if (position === -1) {
      break;
    }
    const rangeStart = pdf.indexOf('[', position);
    const rangeEnd = pdf.indexOf(']', rangeStart);
    const byteRangeString = pdf.subarray(position, rangeEnd + 1);
    byteRangeStrings.push(byteRangeString.toString());
    const range = pdf.subarray(rangeStart + 1, rangeEnd).toString().split(' ').filter(c => c !== '').map(c => c.trim());
    byteRanges.push(range);
    const placeholderName = `/${placeholder}`;
    if (range[0] === '0' && range[1] === placeholderName && range[2] === placeholderName && range[3] === placeholderName) {
      if (typeof byteRangePlaceholder !== 'undefined') {
        throw new _SignPdfError.SignPdfError('Found multiple ByteRange placeholders.', _SignPdfError.SignPdfError.TYPE_INPUT);
      }
      byteRangePlaceholder = byteRangeString.toString();
      byteRangePlaceholderPosition = position;
    }
    offset = rangeEnd;

    // eslint-disable-next-line no-constant-condition
  } while (true);
  return {
    byteRangePlaceholder,
    byteRangePlaceholderPosition,
    byteRangeStrings,
    byteRanges
  };
};
exports.findByteRange = findByteRange;