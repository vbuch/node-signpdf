"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PDFKitReferenceMock = void 0;
var _PDFAbstractReference = _interopRequireDefault(require("./PDFAbstractReference"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PDFKitReferenceMock extends _PDFAbstractReference.default {
  constructor(index, additionalData = undefined) {
    super();
    this.index = index;
    if (typeof additionalData !== 'undefined') {
      Object.assign(this, additionalData);
    }
  }
  toString() {
    return `${this.index} 0 R`;
  }
}
exports.PDFKitReferenceMock = PDFKitReferenceMock;