"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SignPdfError = _interopRequireDefault(require("../../SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */
const readRefTable = (pdfBuffer, position) => {
  const offsetsMap = new Map();
  let refTable = pdfBuffer.slice(position);

  if (refTable.indexOf('xref') !== 0) {
    throw new _SignPdfError.default('Unexpected cross-reference table format.', _SignPdfError.default.TYPE_PARSE);
  }

  refTable = refTable.slice(4);
  refTable = refTable.slice(refTable.indexOf('\n') + 1); // FIXME: This only expects one subsection. Will go wrong if there are multiple.

  let nextNewLine = refTable.indexOf('\n');
  let line = refTable.slice(0, nextNewLine);
  refTable = refTable.slice(nextNewLine + 1);
  let [startingIndex, length] = line.toString().split(' ');
  startingIndex = parseInt(startingIndex);
  length = parseInt(length);
  const tableRows = [];
  let maxOffset = 0;
  let maxIndex = 0;

  for (let i = startingIndex; i < startingIndex + length; i += 1) {
    nextNewLine = refTable.indexOf('\n');
    line = refTable.slice(0, nextNewLine).toString();
    refTable = refTable.slice(nextNewLine + 1);
    tableRows.push(line);
    let [offset] = line.split(' ');
    offset = parseInt(offset);
    maxOffset = Math.max(maxOffset, offset);
    maxIndex = Math.max(maxIndex, i);
    offsetsMap.set(i, offset);
  }

  return {
    tableOffset: position,
    tableRows,
    maxOffset,
    startingIndex,
    maxIndex,
    offsets: offsetsMap
  };
};

var _default = readRefTable;
exports.default = _default;