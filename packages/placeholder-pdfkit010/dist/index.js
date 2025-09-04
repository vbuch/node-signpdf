"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  PDFKitReferenceMock: true,
  PDFObject: true
};
Object.defineProperty(exports, "PDFKitReferenceMock", {
  enumerable: true,
  get: function () {
    return _utils.PDFKitReferenceMock;
  }
});
Object.defineProperty(exports, "PDFObject", {
  enumerable: true,
  get: function () {
    return _utils.PDFObject;
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
var _utils = require("@signpdf/utils");