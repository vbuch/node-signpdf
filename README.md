# node-signpdf

[![npm version](https://badge.fury.io/js/node-signpdf.svg)](https://badge.fury.io/js/node-signpdf)
[![Build Status](https://travis-ci.com/vbuch/node-signpdf.svg?branch=master)](https://travis-ci.com/vbuch/node-signpdf)
[![Coverage Status](https://coveralls.io/repos/github/vbuch/node-signpdf/badge.svg?branch=master)](https://coveralls.io/github/vbuch/node-signpdf?branch=master)

Simple signing of PDFs in node.

* [node-signpdf](#node-signpdf)
  * [Purpose](#purpose)
  * [Usage](#usage)
  * [Notes](#notes)
  * [Signing PDF in simple steps](#signing-pdf-in-simple-steps)
    * [Generate a PDF](#generate-a-pdf)
    * [Append a signature placeholder](#append-a-signature-placeholder)
    * [Generate and apply signature](#generate-and-apply-signature)
  * [Dependencies](#dependencies)
  * [Credits](#credits)
  * [Contributing](#contributing)

## Purpose

The purpose of this package is not as much to be used as a dependendency, although it could. The main purpose is **to demonstrate** the way signing can be achieved **in a piece of readable code** as it can take a lot of hours to figure out.

## Usage

Simply said this could be used in two steps. `install` and `sign`.

Install with  `npm i -S node-signpdf node-forge`.

And call `.sign()`

```javascript
import signer from 'node-signpdf';

const signedPdf = signer.sign(
  fs.readFileSync(PATH_TO_PDF_FILE)
  fs.readFileSync(PATH_TO_P12_CERTIFICATE),
);
```

In practice we expect that most people will just read through the code we've written in the testing part of this package and figure it out themselves. If that's your case, you should read the [[Signing PDF in simple steps]](#signing-pdf-in-simple-steps) section.

To verify a signed pdf call `.verify()`.

```javascript
import signer from 'node-signpdf';
...

const signedPdfBuffer = signer.sign(pdfBuffer, p12Buffer);
const {verified} = signer.verify(signedPdfBuffer);
```

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/acrobatetk/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document.
* This lib:
  * requires the [signature placeholder](#append-a-signature-placeholder) to already be in the document;
  * requires the `Contents` descriptor in the `Sig` be placed after the `ByteRange` one;
  * takes `Buffer`s of the PDF and a P12 certificate to use when [signing](#generate-and-apply-signature);
  * does not cover multiple signatures, incremental updates, etc. Only the basic scenario of signing a freshly created PDF. We actually only worked with documents created with PDFKit;
* Feel free to copy and paste any part of this code. See its defined [Purpose](#purpose).

## Signing PDF in simple steps

### Generate a PDF

See the [unit-testing code](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js). PDFKit is used there for generating the document. This also allows easy addition of the signature placeholder.

### Append a signature placeholder

What's needed is a `Sig` element and a `Widget` that is also linked in a `Form`. The form needs to be referenced in the root descriptor of the PDF as well. A (hopefully) [readable sample](https://github.com/vbuch/node-signpdf/blob/master/src/helpers.js#L12) is available in the helpers. Note the `Contents` descriptor of the `Sig` where zeros are placed that will later be replaced with the actual signature.

**Note:** Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

### Generate and apply signature

That's where `node-signpdf` kicks in. Given a PDF and a P12 certificate a signature is generated in detached mode and is replaced in the placeholder. This is best demonstrated in [the tests](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js#L100).

## Verifying PDF

The signed PDF file has the public certificate embeded in it, so all we need to verify a PDF file is the file itself.

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

[PDFKit](https://github.com/foliojs/pdfkit) is used in the tests for generating a PDF with a signature placeholder.

## Credits

* The whole signing flow is a rework of what's already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
* [node-forge](https://github.com/digitalbazaar/forge) is an awesome package written in pure JavaScript and [supports signing in detached mode](https://github.com/digitalbazaar/forge/pull/605). Many thanks to all the guys who wrote and maintain it.
* Thanks to the guys of [PDFKit](https://github.com/foliojs/pdfkit) as well. They've made PDF generation incredibly easy.
* This incredible [Stack Overflow answer](https://stackoverflow.com/questions/15969733/verify-pkcs7-pem-signature-unpack-data-in-node-js/16148331#16148331) for describing the whole process of verifying PKCS7 signatures.

## Contributing

* All PRs are welcome in the `develop` branch.
* This is a git-flow repo. We use the default git flow with a `v` version prefix.
* Note that [gitmoji](https://gitmoji.carloscuesta.me/) is used in the commit messages. That's not a must but we think it's nice.
