"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _utils = require("@signpdf/utils");
/**
 * @param {object} refTable
 * @param {string} ref
 * @returns {number}
 */
const getIndexFromRef = (refTable, ref) => {
  let [index] = ref.split(' ');
  index = parseInt(index);
  if (!refTable.offsets.has(index)) {
    throw new _utils.SignPdfError(`Failed to locate object "${ref}".`, _utils.SignPdfError.TYPE_PARSE);
  }
  return index;
};
var _default = exports.default = getIndexFromRef;