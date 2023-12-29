"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Signer = void 0;
var _SignPdfError = require("./SignPdfError");
/* eslint-disable no-unused-vars */

class Signer {
  /**
   * @param {Buffer} pdfBuffer
   * @param {Date | undefined} signingTime
   * @returns {Promise<Buffer>}
   */
  async sign(pdfBuffer, signingTime = undefined) {
    throw new _SignPdfError.SignPdfError(`sign() is not implemented on ${this.constructor.name}`, _SignPdfError.SignPdfError.TYPE_INPUT);
  }
}
exports.Signer = Signer;