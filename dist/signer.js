"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SignPdfError = _interopRequireDefault(require("./SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Signer {
  sign() {
    throw new _SignPdfError.default(`sign not implemented on ${this.constructor.name}`, _SignPdfError.default.TYPE_INPUT);
  }

}

exports.default = Signer;