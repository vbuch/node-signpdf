"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPageRef;
var _utils = require("@signpdf/utils");
var _getPagesDictionaryRef = _interopRequireDefault(require("./getPagesDictionaryRef"));
var _findObject = _interopRequireDefault(require("./findObject"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Finds the reference to a page.
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} info As extracted from readRef()
 * @param {Number} [pageNumber = 0] Desired page number
 */
function getPageRef(pdfBuffer, info, pageNumber = 0) {
  const pagesRef = (0, _getPagesDictionaryRef.default)(info);
  const pagesDictionary = (0, _findObject.default)(pdfBuffer, info.xref, pagesRef);
  const kidsPosition = pagesDictionary.indexOf('/Kids');
  const kidsStart = pagesDictionary.indexOf('[', kidsPosition) + 1;
  const kidsEnd = pagesDictionary.indexOf(']', kidsPosition);
  const pages = pagesDictionary.slice(kidsStart, kidsEnd).toString();
  const pagesSplit = [];
  pages.trim().split(' ').forEach((v, i) => i % 3 === 0 ? pagesSplit.push([v]) : pagesSplit[pagesSplit.length - 1].push(v));
  if (pageNumber < 0 || pagesSplit.length <= pageNumber) {
    throw new _utils.SignPdfError(`Failed to get reference of page "${pageNumber}".`, _utils.SignPdfError.TYPE_INPUT);
  }
  return pagesSplit[pageNumber].join(' ');
}