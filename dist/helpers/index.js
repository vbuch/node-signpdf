"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "extractSignature", {
  enumerable: true,
  get: function () {
    return _extractSignature.default;
  }
});
Object.defineProperty(exports, "pdfkitAddPlaceholder", {
  enumerable: true,
  get: function () {
    return _pdfkitAddPlaceholder.default;
  }
});
Object.defineProperty(exports, "plainAddPlaceholder", {
  enumerable: true,
  get: function () {
    return _plainAddPlaceholder.default;
  }
});
Object.defineProperty(exports, "removeTrailingNewLine", {
  enumerable: true,
  get: function () {
    return _removeTrailingNewLine.default;
  }
});
Object.defineProperty(exports, "pdflibAddPlaceholder", {
  enumerable: true,
  get: function () {
    return _pdflibAddPlaceholder.default;
  }
});

var _extractSignature = _interopRequireDefault(require("./extractSignature"));

var _pdfkitAddPlaceholder = _interopRequireDefault(require("./pdfkitAddPlaceholder"));

var _plainAddPlaceholder = _interopRequireDefault(require("./plainAddPlaceholder"));

var _removeTrailingNewLine = _interopRequireDefault(require("./removeTrailingNewLine"));

var _pdflibAddPlaceholder = _interopRequireDefault(require("./pdflibAddPlaceholder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'This string is added so that jest collects coverage for this file'; // eslint-disable-line