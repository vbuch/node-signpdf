# [![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)](https://github.com/vbuch/node-signpdf/)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsignpdf.svg)](https://badge.fury.io/js/@signpdf%2Fsignpdf)
[![Donate to this project using Buy Me A Coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg)](https://buymeacoffee.com/vbuch)

The main package from the [@signpdf family](https://github.com/vbuch/node-signpdf/) that tries to make signing of PDFs simple in Node.js.

## Usage

`$ npm i -S @signpdf/signpdf node-forge`. Then considering you have a well-prepared PDF that already has a signature placeholder usage should be as simple as:

```javascript
import signer from '@signpdf/signpdf';
...
const signedPdf = signer.sign(
  fs.readFileSync(PATH_TO_PDF_FILE),
  fs.readFileSync(PATH_TO_P12_CERTIFICATE),
);
```

If your PDF does not contain a placeholder, we have helpers:

- [@signpdf/placeholder-pdfkit010](/packages/placeholder-pdfkit010)
- [@signpdf/placeholder-plain](/packages/placeholder-plain)

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document. As Adobe's files are deprecated, [here is the standard as defined by ETSI](<https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/Standards+and+specifications#Standardsandspecifications-PAdES(PDFAdvancedElectronicSignature)BaselineProfile>).
* This lib:
  * requires the [signature placeholder](https://github.com/vbuch/node-signpdf#append-a-signature-placeholder) to already be in the document (There are helpers included that can try to add it);
  * requires the `Contents` descriptor in the `Sig` be placed after the `ByteRange` one;
  * takes `Buffer`s of the PDF and a P12 certificate to use when [signing](https://github.com/vbuch/node-signpdf/#generate-and-apply-signature);
  * does cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](https://github.com/vbuch/node-signpdf/blob/develop/CONTRIBUTING.md);
* Feel free to copy and paste any part of this code. See its defined [Purpose](https://github.com/vbuch/node-signpdf#purpose).

### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value. If you are using `placeholder-plain` or `placeholder-pdfkit010` this can be done with a parameter.

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

## Credits

* The whole signing flow is a rework of what's already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
* [node-forge](https://github.com/digitalbazaar/forge) is an awesome package written in pure JavaScript and [supports signing in detached mode](https://github.com/digitalbazaar/forge/pull/605). Many thanks to all the guys who wrote and maintain it.
