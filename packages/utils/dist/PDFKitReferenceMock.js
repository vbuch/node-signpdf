"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PDFKitReferenceMock = void 0;
var _PDFAbstractReference = require("./PDFAbstractReference");
class PDFKitReferenceMock extends _PDFAbstractReference.PDFAbstractReference {
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