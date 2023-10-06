"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPagesDictionaryRef;
var _utils = require("@signpdf/utils");
/**
 * @param {Object} info As extracted from readRef()
 */

function getPagesDictionaryRef(info) {
  const pagesRefRegex = /\/Pages\s+(\d+\s+\d+\s+R)/g;
  const match = pagesRefRegex.exec(info.root);
  if (match === null) {
    throw new _utils.SignPdfError('Failed to find the pages descriptor. This is probably a problem in node-signpdf.', _utils.SignPdfError.TYPE_PARSE);
  }
  return match[1];
}