"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
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
var _ExternalSigner = require("./ExternalSigner");
Object.keys(_ExternalSigner).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ExternalSigner[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ExternalSigner[key];
    }
  });
});