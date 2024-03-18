# [![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)](/)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsignpdf.svg)](https://badge.fury.io/js/@signpdf%2Fsignpdf)

The main package from the [@signpdf family](/) that tries to make signing of PDFs simple in Node.js.

## Usage

`$ npm i -S @signpdf/signpdf node-forge`. Then considering you have a well-prepared PDF that already has a signature placeholder and you have prepared a signer implementation usage should be as simple as:

```javascript
import signpdf from '@signpdf/signpdf';
...
const signedPdf = await signpdf.sign(fs.readFileSync(PATH_TO_PDF_FILE), signer);
```

If your PDF does not contain a placeholder, we have helpers:

- [@signpdf/placeholder-pdfkit010](/packages/placeholder-pdfkit010)
- [@signpdf/placeholder-plain](/packages/placeholder-plain)

We also have a single signer implementation currently:

- [`@signpdf/signer-p12`](/packages/signer-p12)

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document. As Adobe's files are deprecated, [here is the standard as defined by ETSI](<https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/Standards+and+specifications#Standardsandspecifications-PAdES(PDFAdvancedElectronicSignature)BaselineProfile>).
* This lib:
  * requires the [signature placeholder](/#append-a-signature-placeholder) to already be in the document (There are helpers included that can try to add it);
  * requires the `Contents` descriptor in the `Sig` be placed after the `ByteRange` one;
  * takes `Buffer` of the PDF and a [Signer implementation](/#signers) to use when [signing](/#generate-and-apply-signature);
  * does cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](/CONTRIBUTING.md);
* Feel free to copy and paste any part of this code. See its defined [Purpose](/#purpose).

### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value. If you are using [placeholder-plain](/packages/placeholder-plain) or [placeholder-pdfkit010](/packages/placeholder-pdfkit010) this can be done with a parameter.

## Credits

* The whole signing flow is a rework of what's already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
