"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const ERROR_TYPE_UNKNOWN = exports.ERROR_TYPE_UNKNOWN = 1;
const ERROR_TYPE_INPUT = exports.ERROR_TYPE_INPUT = 2;
const ERROR_TYPE_PARSE = exports.ERROR_TYPE_PARSE = 3;

class SignPdfError extends Error {
    constructor(msg, type = ERROR_TYPE_UNKNOWN) {
        super(msg);
        this.type = type;
    }
}

// Shorthand
SignPdfError.TYPE_UNKNOWN = ERROR_TYPE_UNKNOWN;
SignPdfError.TYPE_INPUT = ERROR_TYPE_INPUT;
SignPdfError.TYPE_PARSE = ERROR_TYPE_PARSE;

exports.default = SignPdfError;