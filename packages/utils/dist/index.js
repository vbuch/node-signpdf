"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _const = require("./const");
Object.keys(_const).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _const[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _const[key];
    }
  });
});
var _convertBuffer = require("./convertBuffer");
Object.keys(_convertBuffer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _convertBuffer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _convertBuffer[key];
    }
  });
});
var _extractSignature = require("./extractSignature");
Object.keys(_extractSignature).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _extractSignature[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _extractSignature[key];
    }
  });
});
var _findByteRange = require("./findByteRange");
Object.keys(_findByteRange).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _findByteRange[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _findByteRange[key];
    }
  });
});
var _removeTrailingNewLine = require("./removeTrailingNewLine");
Object.keys(_removeTrailingNewLine).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _removeTrailingNewLine[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _removeTrailingNewLine[key];
    }
  });
});
var _SignPdfError = require("./SignPdfError");
Object.keys(_SignPdfError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _SignPdfError[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _SignPdfError[key];
    }
  });
});
var _Signer = require("./Signer");
Object.keys(_Signer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Signer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Signer[key];
    }
  });
});