"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SignPdfError = _interopRequireDefault(require("../../SignPdfError"));

var _findObject = _interopRequireDefault(require("./findObject"));

var _getIndexFromRef = _interopRequireDefault(require("./getIndexFromRef"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createBufferPageWithAnnotation = (pdf, info, pagesRef, widget) => {
  const pagesDictionary = (0, _findObject.default)(pdf, info.xref, pagesRef).toString();

  if (pagesDictionary.indexOf('/Annots') !== -1) {
    throw new _SignPdfError.default('There already are /Annots described. This is not yet supported', _SignPdfError.default.TYPE_PARSE);
  }

  const pagesDictionaryIndex = (0, _getIndexFromRef.default)(info.xref, pagesRef);
  return Buffer.concat([Buffer.from(`${pagesDictionaryIndex} 0 obj\n`), Buffer.from('<<\n'), Buffer.from(`${pagesDictionary}\n`), Buffer.from(`/Annots [${widget}]`), Buffer.from('\n>>\nendobj\n')]);
};

var _default = createBufferPageWithAnnotation;
exports.default = _default;