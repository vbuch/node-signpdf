# ![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)

[![Known Vulnerabilities](https://snyk.io/test/npm/node-signpdf/badge.svg)](https://snyk.io/test/npm/node-signpdf)
![Coverage as reported by Coveralls](https://img.shields.io/coverallsCoverage/github/vbuch/node-signpdf)
![GitHub last commit](https://img.shields.io/github/last-commit/vbuch/node-signpdf?color=red)

Formerly known as [`node-signpdf`](https://www.npmjs.com/package/node-signpdf) `@signpdf` is a family of packages trying to make signing of PDFs simple in Node.js.

* [@signpdf](#signpdf)
  * [Purpose](#purpose)
  * [Usage](#usage)
  * [Packages](#packages)
  * [Notes](#notes)
  * [Signing PDF in simple steps](#signing-pdf-in-simple-steps)
    * [Generate a PDF](#generate-a-pdf)
    * [Append a signature placeholder](#append-a-signature-placeholder)
    * [Generate and apply signature](#generate-and-apply-signature)
  * [Credits](#credits)
  * [Contributing](#contributing)

## Purpose

The main purpose of this package is **to demonstrate** the way signing can be achieved **in a piece of readable code** as it can take a lot of hours to figure out.

## Usage

When this repo was started we really wanted people to understand the signing flow. If that's your case, you should read the [[Signing PDF in simple steps]](#signing-pdf-in-simple-steps) section. If you are here with "Give me the code", you should maybe go to [our packages/examples](/packages/examples).

Depending on your usecase you may need different combinations of packages.

### I am getting PDFs that already have placeholders

This is the most simple case of them all. `$ npm i -S @signpdf/signpdf @signpdf/signer-p12 node-forge`. Then have a look at the [with-placeholder.js example](/packages/examples/src/with-placeholder.js). It should be as simple as:

```javascript
import signpdf from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
...
const signer = new P12Signer(fs.readFileSync(PATH_TO_P12_CERTIFICATE));
const signedPdf = await signpdf.sign(fs.readFileSync(PATH_TO_PDF_FILE), signer);
```

### I am generating a PDF with PDFKit

This is how the library was started as we needed to sign a document that we were generating on the fly. You will need `$ npm i -S @signpdf/signpdf @signpdf/placeholder-pdfkit010 @signpdf/signer-p12 node-forge` and a look at the [pdfkit010.js example](/packages/examples/src/pdfkit010.js).

### I have a .pdf file and I want to sign it

This seems to be the most common usecase - people work with PDF documents coming from different sources and they need to digitally sign them. Both [placeholder helpers](#placeholder-helpers) placeholder-plain and placeholder-pdf-lib can help here.

#### Plain

Start with `$ npm i -S @signpdf/signpdf @signpdf/placeholder-plain @signpdf/signer-p12 node-forge`. Head over to either [the JS example](/packages/examples/src/javascript.js) or [the TS one](/packages/examples/src/typescript.ts). An advantage of working with the plain version would be that in theory it should be quicker and use less memory (not benchmarked). A great disadvantage: it is very fragile relying on strings being poisitioned in a certain way.

#### PDF-LIB

`$ npm i -S @signpdf/signpdf @signpdf/placeholder-pdf-lib pdf-lib @signpdf/signer-p12 node-forge` gets you started. Then comes the [the PDF-LIB example](/packages/examples/src/pdf-lib.js). PDF-LIB provides tremendous PDF API, it is very well documented and well supported.
  
## Packages

`@signpdf` is split into multiple packages. In the case where you are already working with the PDF-generating library PDFKit, this is the command you will start with once you want to start signing these documents: `$ npm i -S @signpdf/signpdf @signpdf/placeholder-pdfkit010 @signpdf/signer-p12 node-forge`. So what are all these packages and why do you need them?

### [@signpdf/signpdf](/packages/signpdf)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsignpdf.svg)](https://badge.fury.io/js/@signpdf%2Fsignpdf)

This is the main package, the integrating one, the one that wraps everything up. It uses a [Signer](#signers) implementation that provides cryptographic signing to sign a well-prepared PDF document. A PDF document is well-prepared if it has a signature placeholder. If your PDF does not have that, you may want to add one using one of our [placeholder helpers](#placeholder-helpers).

### Signers

Signers are small libraries that `@signpdf/signpdf` will call with a PDF and they will know how to provide an e-signature in return. Their output is then fed as the signature in the resulting document. Example implementations of the abstract `Signer` base class are provided in the [WebCrypto](./packages/examples/src/webcrypto.js) and [WebCrypto-External](./packages/examples/src/webcrypto-external.js) examples, both leveraging the `WebCrypto` API.

#### [@signpdf/signer-p12](./packages/signer-p12)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsigner-p12.svg)](https://badge.fury.io/js/@signpdf%2Fsigner-p12)

With the help of its [peerDependency `node-forge`](#node-forge) the P12 signer provides the actual cryptographic signing of a Buffer using a P12 certificate bundle. This is done in detached mode as required for PDF.

### Placeholder helpers

A placeholder is the e-signature equivallent of the label "Sign here:......." in your paper document. They are a required part of the process of [Signing PDFs](#signing-pdf-in-simple-steps). Different projects acquire their PDFs differently so we try to support some helpers that know how to add e-signature placeholders.

#### [@signpdf/placeholder-pdfkit](/packages/placeholder-pdfkit)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit)

Works on top of `PDFKit 0.11.0+` and given a `PDFDocument` that is in the works (*not yet ended*), adds an e-signature placeholder. When the placeholder is in place `@signpdf/signpdf` can complete the process.

#### [@signpdf/placeholder-pdfkit010](/packages/placeholder-pdfkit010)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit010.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdfkit010)

Works on top of `PDFKit 0.10.0` and given a `PDFDocument` that is in the works (*not yet ended*), adds an e-signature placeholder. When the placeholder is in place `@signpdf/signpdf` can complete the process.

#### [@signpdf/placeholder-plain](/packages/placeholder-plain)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-plain)

Uses the process and knowledge from `placeholder-pdfkit010` on how to add e-signature placeholder but implements it with plain string operations (`.indexOf()`, `.replace()`, `.match()`, etc.). Because of the lack of semantics it is rather *fragile*. Additionally it doesn't support streams and only works on PDF version <= 1.3. Regardless of those disadvantages this helper seems to be the most popular among the users of `@signpdf`. When the placeholder is in place `@signpdf/signpdf` can complete the process.

#### [@signpdf/placeholder-pdf-lib](/packages/placeholder-pdf-lib)

[![npm version](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdf-lib.svg)](https://badge.fury.io/js/@signpdf%2Fplaceholder-pdf-lib)

Works with PDF-LIB and given a loaded `PDFDocument`, adds an e-signature placeholder. When the placeholder is in place `@signpdf/signpdf` can complete the process.

## Notes

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document. As Adobe's files are deprecated, [here is the standard as defined by ETSI](<https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/Standards+and+specifications#Standardsandspecifications-PAdES(PDFAdvancedElectronicSignature)BaselineProfile>).
* We cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](#contributing);
* Feel free to copy and paste any part of this code. See its defined [Purpose](#purpose).

## Signing PDF in simple steps

### Generate a PDF or read a ready one

We have examples of PDFKit generation of documents and we also have some where a ready .pdf file is read. Browse through [our examples](/packages/examples).

### Append a signature placeholder

What's needed is a `Sig` element and a `Widget` that is also linked in a `Form`. The form needs to be referenced in the `Root` descriptor of the PDF as well. A (hopefully) [readable sample](/packages/placeholder-pdfkit010/src/pdfkitAddPlaceholder.js) is available in the helpers. Note the `Contents` descriptor of the `Sig` where zeros are placed that will later be replaced with the actual signature.

We provides [placeholder helpers](#placeholder-helpers) that do that.

#### Signature length

**Note:** Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

#### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value. This can be declared using the `subFilter` option argument passed to placeholder helpers.

```js
import { pdfkitAddPlaceholder } from '@signpdf/placeholder-pdfkit010';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';

const pdfToSign = pdfkitAddPlaceholder({
  ...,
  subFilter: SUBFILTER_ETSI_CADES_DETACHED,
});
```

### Generate and apply signature

That's where the `@signpdf/signpdf` kicks in. Given a PDF and a [signer implementation](#signers) a signature is generated and replaced in the placeholder.

```js
import signpdf from '@signpdf/signpdf';

...
const signedPdf = await signpdf.sign(pdfBuffer, signer);
```

## Credits

### node-forge

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures. It is an awesome package written in pure JavaScript and [supports signing in detached mode](https://github.com/digitalbazaar/forge/pull/605). Many thanks to all the guys who wrote and maintain it.

### PDFKit

[PDFKit](https://github.com/foliojs/pdfkit) is extensively used for generating PDFs with a signature placeholder and additionally its flows are used in `placeholder-plain`. Thanks to the guys of [PDFKit](https://github.com/foliojs/pdfkit) as they've made PDF generation incredibly easy.

### pdfsign.js

The signing flow of `@signpdf/signpdf` and `@signpdf/signer-p12` is a rework of what was already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek).

## [Contributing](/CONTRIBUTING.md)

## [Changelog](/CHANGELOG.md)
