"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignPdfError = exports.ERROR_VERIFY_SIGNATURE = exports.ERROR_TYPE_UNKNOWN = exports.ERROR_TYPE_PARSE = exports.ERROR_TYPE_INPUT = void 0;
const ERROR_TYPE_UNKNOWN = exports.ERROR_TYPE_UNKNOWN = 1;
const ERROR_TYPE_INPUT = exports.ERROR_TYPE_INPUT = 2;
const ERROR_TYPE_PARSE = exports.ERROR_TYPE_PARSE = 3;
const ERROR_VERIFY_SIGNATURE = exports.ERROR_VERIFY_SIGNATURE = 4;
class SignPdfError extends Error {
  constructor(msg, type = ERROR_TYPE_UNKNOWN) {
    super(msg);
    this.type = type;
  }
}

// Shorthand
exports.SignPdfError = SignPdfError;
SignPdfError.TYPE_UNKNOWN = ERROR_TYPE_UNKNOWN;
SignPdfError.TYPE_INPUT = ERROR_TYPE_INPUT;
SignPdfError.TYPE_PARSE = ERROR_TYPE_PARSE;
SignPdfError.VERIFY_SIGNATURE = ERROR_VERIFY_SIGNATURE;