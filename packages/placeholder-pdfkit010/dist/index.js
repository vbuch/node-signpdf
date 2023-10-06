"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  PDFObject: true
};
Object.defineProperty(exports, "PDFObject", {
  enumerable: true,
  get: function () {
    return _pdfobject.default;
  }
});
var _pdfkitAddPlaceholder = require("./pdfkitAddPlaceholder");
Object.keys(_pdfkitAddPlaceholder).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _pdfkitAddPlaceholder[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pdfkitAddPlaceholder[key];
    }
  });
});
var _pdfkitReferenceMock = require("./pdfkitReferenceMock");
Object.keys(_pdfkitReferenceMock).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _pdfkitReferenceMock[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pdfkitReferenceMock[key];
    }
  });
});
var _pdfobject = _interopRequireDefault(require("./pdfkit/pdfobject"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }