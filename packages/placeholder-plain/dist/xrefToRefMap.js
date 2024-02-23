"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _utils = require("@signpdf/utils");
/**
 * @param {string} xrefString
 * @returns {Map<number, number>}
 */
const xrefToRefMap = xrefString => {
  const lines = xrefString.split('\n').filter(l => l !== '');
  let index = 0;
  let expectedLines = 0;
  const xref = new Map();
  lines.forEach(line => {
    const split = line.split(' ');
    if (split.length === 2) {
      index = parseInt(split[0]);
      expectedLines = parseInt(split[1]);
      return;
    }
    if (expectedLines <= 0) {
      throw new _utils.SignPdfError('Too many lines in xref table.', _utils.SignPdfError.TYPE_PARSE);
    }
    expectedLines -= 1;
    const [offset,, inUse] = split;
    if (inUse.trim() === 'f') {
      index += 1;
      return;
    }
    if (inUse.trim() !== 'n') {
      throw new _utils.SignPdfError(`Unknown in-use flag "${inUse}". Expected "n" or "f".`, _utils.SignPdfError.TYPE_PARSE);
    }
    if (!/^\d+$/.test(offset.trim())) {
      throw new _utils.SignPdfError(`Expected integer offset. Got "${offset}".`, _utils.SignPdfError.TYPE_PARSE);
    }
    const storeOffset = parseInt(offset.trim());
    xref.set(index, storeOffset);
    index += 1;
  });
  return xref;
};
var _default = exports.default = xrefToRefMap;