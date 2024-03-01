# Helper that provides placeholder using PDF-LIB

for [![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)](https://github.com/vbuch/node-signpdf/)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdf-lib.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdf-lib)

Works with `PDF-LIB` and given a PDFDocument that is in the works, adds an e-signature placeholder. When the PDF is ready you can convert it to Buffer and pass it to `@signpdf/signpdf` to complete the process.

## Usage

You will need `$ npm i -S @signpdf/placeholder-pdf-lib pdf-lib @signpdf/signpdf node-forge` and a look at the [pdf-lib.js example](/packages/examples/src/pdf-lib.js).

## Notes

* Make sure to have a look at the docs of the [@signpdf family of packages](https://github.com/vbuch/node-signpdf/).
* Feel free to copy and paste any part of this code. See its defined [Purpose](https://github.com/vbuch/node-signpdf#purpose).

### Signature length

Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value.

This can be declared using the subFilter option argument.

```js
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';

pdflibAddPlaceholder({
  pdfDoc: pdfToSign,
  ...,
  subFilter: SUBFILTER_ETSI_CADES_DETACHED,
});
```
