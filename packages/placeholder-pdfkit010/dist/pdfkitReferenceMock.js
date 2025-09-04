"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PDFKitReferenceMock = void 0;
var _abstract_reference = _interopRequireDefault(require("./pdfkit/abstract_reference"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PDFKitReferenceMock extends _abstract_reference.default {
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