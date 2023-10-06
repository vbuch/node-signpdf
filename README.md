# ![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)

[![Known Vulnerabilities](https://snyk.io/test/npm/node-signpdf/badge.svg)](https://snyk.io/test/npm/node-signpdf)
![Coverage as reported by Coveralls](https://img.shields.io/coverallsCoverage/github/vbuch/node-signpdf)
![GitHub last commit](https://img.shields.io/github/last-commit/vbuch/node-signpdf?color=red)
[![Donate to this project using Buy Me A Coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg)](https://buymeacoffee.com/vbuch)

`@signpdf` is a family of packages trying to make signing of PDFs simple in Node.js. Formerly known as [`node-signpdf`](https://www.npmjs.com/package/node-signpdf).

* [@signpdf](#signpdf)
  * [Purpose](#purpose)
  * [Usage](#usage)
  * [Packages](#packages)
  * [Notes](#notes)
  * [Signing PDF in simple steps](#signing-pdf-in-simple-steps)
    * [Generate a PDF](#generate-a-pdf)
    * [Append a signature placeholder](#append-a-signature-placeholder)
    * [Generate and apply signature](#generate-and-apply-signature)
  * [Dependencies](#dependencies)
  * [Credits](#credits)
  * [Contributing](#contributing)

## Purpose

The main purpose of this package is **to demonstrate** the way signing can be achieved **in a piece of readable code** as it can take a lot of hours to figure out.

## Usage

When this repo was started we really wanted people to understand the signing flow. If that's your case, you should read the [[Signing PDF in simple steps]](#signing-pdf-in-simple-steps) section. If you are here with "Give me the code", you should maybe go to [our packages/examples](/packages/examples).

Depending on your usecase you may need different combinations of packages.

### I am getting PDFs that already have placeholders

This is the most simple case of them all. You only need the signer. `$ npm i -S @signpdf/signpdf node-forge`. Then have a look at the [with-placeholder.js example](/packages/examples/with-placeholder.js). It should be as simple as:

```javascript
import signer from 'node-signpdf';
...
const signedPdf = signer.sign(
  fs.readFileSync(PATH_TO_PDF_FILE),
  fs.readFileSync(PATH_TO_P12_CERTIFICATE),
);
```

### I am generating a PDF with PDFKit

This is how the library was started as we needed to sign a document that we were generating on the fly. You will need `$ npm i -S @signpdf/signpdf @signpdf/placeholder-pdfkit010 node-forge` and a look at the [pdfkit010.js example](/packages/examples/pdfkit010.js).

### I have a .pdf file and I want to sign it

This seems to be the most common usecase - people work with PDF documents coming from different sources and they need to digitally sign them. The [placeholder-plain](#placeholder-plain) helper can help here. Start with `$ npm i -S @signpdf/signpdf @signpdf/placeholder-plain node-forge`. Head over to either [the JS example](/packages/examples/javascript.js) or [the TS one](/packages/examples/typescript.ts). And note that the process may look simple on the surface but it is very fragile inside. Should you need some help go stright to [our GitHub Issues](https://github.com/vbuch/node-signpdf/issues?q=is%3Aissue).
  
## Packages

### [signpdf](/packages/signpdf)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsignpdf.svg)](https://badge.fury.io/js/@signpdf%2Fsignpdf)

With the help of `node-forge` provides the actual cryptographic signing of a well-prepared PDF document. A PDF document is well-prepared if it has a signature placeholder - that is the e-signature aquivallent of the label "Signature:......." in your paper document. If your PDF does not have that, you may want to add one using one of our placeholder helpers (see the other packages).

### [placeholder-pdfkit010](/packages/placeholder-pdfkit010)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit010.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit010)

Works on top of `PDFKit 0.10.0` and given a PDFDocument that is in the works, adds an e-signature placeholder. When the PDF is ready you can pass it to `@signpdf/signpdf` to complete the process.

### [placeholder-plain](/packages/placeholder-plain)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain)

Uses the process and knowledge of adding e-signature placeholder from `placeholder-pdfkit010` but implements it with plain string operations (.indexOf(), .replace(), .match(), etc.). Because of the lack of semantics it is rather fragile. Additionally it doesn't support streams and only works on PDF version <= 1.3. Regardless of those disadvantages this helper seems to be the most popular among the users of @signpdf.

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document. As Adobe's files are deprecated, [here is the standard as defined by ETSI](<https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/Standards+and+specifications#Standardsandspecifications-PAdES(PDFAdvancedElectronicSignature)BaselineProfile>).
* The @signpdf/signpdf lib requires the [signature placeholder](#append-a-signature-placeholder) to already be in the document. See the placeholder packages for assistance with that;
* We cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](#contributing);
* Feel free to copy and paste any part of this code. See its defined [Purpose](#purpose).

## Signing PDF in simple steps

### Generate a PDF or read a ready one

We examples of PDFKit generation of documents and we also have some where a ready .pdf file is read. Browse through [our example](/packages/examples).

### Append a signature placeholder

What's needed is a `Sig` element and a `Widget` that is also linked in a `Form`. The form needs to be referenced in the root descriptor of the PDF as well. A (hopefully) [readable sample](/packages/placeholder-pdfkit010/src/pdfkitAddPlaceholder.js) is available in the helpers. Note the `Contents` descriptor of the `Sig` where zeros are placed that will later be replaced with the actual signature.

This package provides two helpers for adding the signature placeholder:

* [`@signpdf/placeholder-pdfkit010`](#placeholder-pdfkit010)
* [`@signpdf/placeholder-plain`](#placeholder-plain)

**Note:** Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

#### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value.

This can be declared using the subFilter option argument passed to `pdfkitAddPlaceholder` and `plainAddPlaceholder`.

```js
import { pdfkitAddPlaceholder } from '@signpdf/placeholder-pdfkit010';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';

const pdfToSign = pdfkitAddPlaceholder({
  ...,
  subFilter: SUBFILTER_ETSI_CADES_DETACHED,
});
```

### Generate and apply signature

That's where the Signer kicks in. Given a PDF and a P12 certificate a signature is generated in detached mode and is replaced in the placeholder.

```js
import signer from '@signpdf/signpdf';

...
const signedPdf = signer.sign(pdfBuffer, certificateBuffer);
```

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

[PDFKit](https://github.com/foliojs/pdfkit) is extensively used for generating PDFs with a signature placeholder and additionally its flows are used in `placeholder-plain`.

## Credits

* The whole signing flow is a rework of what's already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
* [node-forge](https://github.com/digitalbazaar/forge) is an awesome package written in pure JavaScript and [supports signing in detached mode](https://github.com/digitalbazaar/forge/pull/605). Many thanks to all the guys who wrote and maintain it.
* Thanks to the guys of [PDFKit](https://github.com/foliojs/pdfkit) as well. They've made PDF generation incredibly easy.

## [Contributing](/CONTRIBUTING.md)

## [Changelog](/CHANGELOG.md)
