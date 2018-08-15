# node-signpdf

[![npm package](https://nodei.co/npm/node-signpdf.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-signpdf/)

[![Build Status](https://travis-ci.com/vbuch/node-signpdf.svg?branch=master)](https://travis-ci.com/vbuch/node-signpdf)

Simple signing of PDFs in node.

## Usage

See [Signing PDF in simple steps](#signing-pdf-in-simple-steps)

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/acrobatetk/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document.

* This lib:
  * requires the [signature placeholder](#append-a-signature-placeholder) to already be in the document. Takes `Buffer`s of the PDF and a P12 certificate to use when [signing](#generate-and-apply-signature)
  * does not cover multiple signatures, incremental updates, etc. Only the basic scenario of signing a freshly created PDF.

## Signing PDF in simple steps

### Generate a PDF

In the test PDFKit is used for generating the PDF. This also allows easy addition of the signature placeholder.

### Append a signature placeholder

What's needed is a `Sig` element and a `Widget` that is also linked in a `Form`. The form needs to be referenced in the root descriptor of the PDF as well. A [readable sample](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js#L13) is available in the test.

### Generate and apply signature

That's where `node-signpdf` kicks in. Given a PDF and a P12 certificate a signature is generated in detached mode and is replaced in the placeholder. This is best demonstrated in [the tests](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js#L124).

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

[PDFKit](https://github.com/foliojs/pdfkit) is used in the tests for generating a PDF with a signature placeholder.

## Credits

The whole [signing flow](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.js#L27) is a rework of what's already [in  pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
