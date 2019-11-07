"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _findObject = _interopRequireDefault(require("./findObject"));

var _getIndexFromRef = _interopRequireDefault(require("./getIndexFromRef"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createBufferPageWithAnnotation = (pdf, info, pagesRef, widget) => {
  const pagesDictionary = (0, _findObject.default)(pdf, info.xref, pagesRef).toString(); // Extend page dictionary with newly created annotations

  const splittedDictionary = pagesDictionary.split('/Annots')[0];
  let splittedIds = pagesDictionary.split('/Annots')[1]; // eslint-disable-next-line no-useless-escape

  splittedIds = splittedIds === undefined ? '' : splittedIds.replace(/[\[\]]/g, '');
  const pagesDictionaryIndex = (0, _getIndexFromRef.default)(info.xref, pagesRef);
  const widgetValue = widget.toString();
  return Buffer.concat([Buffer.from(`${pagesDictionaryIndex} 0 obj\n`), Buffer.from('<<\n'), Buffer.from(`${splittedDictionary}\n`), Buffer.from(`/Annots [${splittedIds} ${widgetValue}]`), Buffer.from('\n>>\nendobj\n')]);
};

var _default = createBufferPageWithAnnotation;
exports.default = _default;