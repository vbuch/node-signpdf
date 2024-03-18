# Helper that provides placeholder using string operations

for [![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)](https://github.com/vbuch/node-signpdf/)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain)

Implements adding e-signature placeholder with plain string operations (.indexOf(), .replace(), .match(), etc.). Because of the lack of semantics it is rather *fragile*. Additionally it doesn't support streams and only works on PDF version <= 1.3. Regardless of those disadvantages this flow seems to be **the most popular among the users of @signpdf**.

## Usage

Start with `$ npm i -S @signpdf/signpdf @signpdf/placeholder-plain node-forge`. Head over to either [the JS example](/packages/examples/src/javascript.js) or [the TS one](/packages/examples/src/typescript.ts). 

## Issues

Should you need some help go stright to [our GitHub Issues](https://github.com/vbuch/node-signpdf/issues).

## Notes

* Make sure to have a look at the docs of the [@signpdf family of packages](https://github.com/vbuch/node-signpdf/).
* This lib does cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](https://github.com/vbuch/node-signpdf/blob/develop/CONTRIBUTING.md);
* Feel free to copy and paste any part of this code. See its defined [Purpose](https://github.com/vbuch/node-signpdf#purpose).

### Signature length

Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value. This can be declared using the subFilter option argument.

```js
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';

const pdfToSign = plainAddPlaceholder({
  ...,
  subFilter: SUBFILTER_ETSI_CADES_DETACHED,
});
```
