"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertBuffer = convertBuffer;
var _SignPdfError = require("./SignPdfError");
/**
 * @param {Buffer | Uint8Array | string} input
 * @param {string} name
 * @returns {Buffer}
 */
function convertBuffer(input, name) {
  if (typeof input === 'string') {
    return Buffer.from(input, 'base64');
  }
  if (input instanceof Buffer || input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  throw new _SignPdfError.SignPdfError(`${name} expected as Buffer, Uint8Array or base64-encoded string.`, _SignPdfError.SignPdfError.TYPE_INPUT);
}