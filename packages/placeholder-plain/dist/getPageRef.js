"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPageRef;
var _getPagesDictionaryRef = _interopRequireDefault(require("./getPagesDictionaryRef"));
var _findObject = _interopRequireDefault(require("./findObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Finds the reference to a page.
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} info As extracted from readRef()
 */
function getPageRef(pdfBuffer, info) {
  const pagesRef = (0, _getPagesDictionaryRef.default)(info);
  const pagesDictionary = (0, _findObject.default)(pdfBuffer, info.xref, pagesRef);
  const kidsPosition = pagesDictionary.indexOf('/Kids');
  const kidsStart = pagesDictionary.indexOf('[', kidsPosition) + 1;
  const kidsEnd = pagesDictionary.indexOf(']', kidsPosition);
  const pages = pagesDictionary.slice(kidsStart, kidsEnd).toString();
  const split = pages.trim().split(' ', 3);
  return `${split[0]} ${split[1]} ${split[2]}`;
}