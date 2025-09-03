"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getXref = exports.getLastTrailerPosition = exports.getFullXrefTable = exports.default = void 0;
var _utils = require("@signpdf/utils");
var _xrefToRefMap = _interopRequireDefault(require("./xrefToRefMap"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const getLastTrailerPosition = pdf => {
  const trailerStart = pdf.lastIndexOf(Buffer.from('trailer', 'utf8'));
  const trailer = pdf.slice(trailerStart, pdf.length - 6);
  const xRefPosition = trailer.slice(trailer.lastIndexOf(Buffer.from('startxref', 'utf8')) + 10).toString();
  return parseInt(xRefPosition);
};
exports.getLastTrailerPosition = getLastTrailerPosition;
const getXref = (pdf, position) => {
  let refTable = pdf.slice(position); // slice starting from where xref starts
  const realPosition = refTable.indexOf(Buffer.from('xref', 'utf8'));
  if (realPosition === -1) {
    throw new _utils.SignPdfError(`Could not find xref anywhere at or after ${position}.`, _utils.SignPdfError.TYPE_PARSE);
  }
  if (realPosition > 0) {
    const prefix = refTable.slice(0, realPosition);
    if (prefix.toString().replace(/\s*/g, '') !== '') {
      throw new _utils.SignPdfError(`Expected xref at ${position} but found other content.`, _utils.SignPdfError.TYPE_PARSE);
    }
  }
  const nextEofPosition = refTable.indexOf(Buffer.from('%%EOF', 'utf8'));
  if (nextEofPosition === -1) {
    throw new _utils.SignPdfError('Expected EOF after xref and trailer but could not find one.', _utils.SignPdfError.TYPE_PARSE);
  }
  refTable = refTable.slice(0, nextEofPosition);
  refTable = refTable.slice(realPosition + 4); // move ahead with the "xref"
  refTable = refTable.slice(refTable.indexOf('\n') + 1); // move after the next new line

  // extract the size
  let size = refTable.toString().split('/Size')[1];
  if (!size) {
    throw new _utils.SignPdfError('Size not found in xref table.', _utils.SignPdfError.TYPE_PARSE);
  }
  size = /^\s*(\d+)/.exec(size);
  if (size === null) {
    throw new _utils.SignPdfError('Failed to parse size of xref table.', _utils.SignPdfError.TYPE_PARSE);
  }
  size = parseInt(size[1]);
  const [objects, infos] = refTable.toString().split('trailer');
  const isContainingPrev = infos.split('/Prev')[1] != null;
  let prev;
  if (isContainingPrev) {
    const pagesRefRegex = /Prev (\d+)/g;
    const match = pagesRefRegex.exec(infos);
    const [, prevPosition] = match;
    prev = prevPosition;
  }
  const xRefContent = (0, _xrefToRefMap.default)(objects);
  return {
    size,
    prev,
    xRefContent
  };
};

/**
 * @typedef {Map<number, number>} FullXrefTable
 */

/**
 * @param {Buffer} pdf
 * @param {number} xRefPosition
 * @returns {FullXrefTable}
 */
exports.getXref = getXref;
const getFullXref = (pdf, xRefPosition) => {
  const lastXrefTable = getXref(pdf, xRefPosition);
  if (lastXrefTable.prev === undefined) {
    return lastXrefTable.xRefContent;
  }
  const partOfXrefTable = getFullXref(pdf, lastXrefTable.prev);
  const mergedXrefTable = new Map([...partOfXrefTable, ...lastXrefTable.xRefContent]);
  return mergedXrefTable;
};

/**
 * @param {Buffer} pdf
 * @returns {FullXrefTable}
 */
const getFullXrefTable = pdf => {
  const lastTrailerPosition = getLastTrailerPosition(pdf);
  return getFullXref(pdf, lastTrailerPosition);
};

/**
 * @typedef {object} ReadRefTableReturnType
 * @prop {number} startingIndex
 * @prop {number} maxIndex
 * @prop {FullXrefTable} offsets
 */

/**
 * @param {Buffer} pdfBuffer
 * @returns {ReadRefTableReturnType}
 */
exports.getFullXrefTable = getFullXrefTable;
const readRefTable = pdf => {
  const fullXrefTable = getFullXrefTable(pdf);
  const startingIndex = 0;
  const maxIndex = Math.max(...fullXrefTable.keys());
  return {
    startingIndex,
    maxIndex,
    offsets: fullXrefTable
  };
};
var _default = exports.default = readRefTable;