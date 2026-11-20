"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapePdfName = void 0;
const DELIMITERS = '()<>[]{}/%#';

/**
 * Escapes a value so it can be written as a PDF name object (without the leading slash).
 *
 * As per ISO 32000-1 7.3.5, the value is encoded as UTF-8 and every byte outside
 * the range ! to ~, every delimiter and the number sign itself is written as #XX
 * (uppercase hex, which every reader decodes; pdf-lib 1.17.1 does not decode #xx).
 * Values that need no escaping are returned unchanged.
 * @param {string} name
 * @returns {string}
 */
const escapePdfName = name => Array.from(Buffer.from(name, 'utf8'), byte => {
  const character = String.fromCharCode(byte);
  if (byte < 0x21 || byte > 0x7e || DELIMITERS.includes(character)) {
    return `#${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  }
  return character;
}).join('');
exports.escapePdfName = escapePdfName;