# **node-signpdf is DEPRECATAED**

It is being replaced by [@signpdf](https://github.com/vbuch/node-signpdf).

_________________________________

![Deprecated since Oct 2023](https://img.shields.io/badge/deprecated-since_Oct_2023-red) [![Replaced by @signpdf/signpdf](https://img.shields.io/badge/replaced_by-@signpdf/signpdf-green)](https://github.com/vbuch/node-signpdf)

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

![Deprecated since Oct 2023](https://img.shields.io/badge/deprecated-since_Oct_2023-red) [![Replaced by @signpdf/signpdf](https://img.shields.io/badge/replaced_by-@signpdf/signpdf-green)](https://github.com/vbuch/node-signpdf)

Install with  `npm i -S node-signpdf node-forge`.

In practice we expect that most people will just read through the code we've written in the testing part of this package and figure it out themselves. If that's your case, you should read the [[Signing PDF in simple steps]](#signing-pdf-in-simple-steps) section.

### With pdfkit-created document

You have already created a PDF using foliojs/pdfkit and you want to sign that. Before saving (writing to fs, or just converting to `Buffer`) your file, you need to a add a signature placeholder to it. We have a helper for that. This is demonstrated in [the `signs input PDF` test](./src/signpdf.test.js#L125).

Once you have the placeholder, just [[sign the document]](#sign-the-document).

### With any PDF document

Yes. This is new since version 1.0. We have a helper that can add a signature placeholder in at least the most basic PDFs without depending on pdfkit. You can see how this is done in [the `signs a ready pdf` test](./src/signpdf.test.js#L167).

Once you have the placeholder, just [[sign the document]](#sign-the-document).

### Sign the document

```javascript
import signer from 'node-signpdf';
...
const signedPdf = signer.sign(
  fs.readFileSync(PATH_TO_PDF_FILE),
  fs.readFileSync(PATH_TO_P12_CERTIFICATE),
);
```

## Notes

![Deprecated since Oct 2023](https://img.shields.io/badge/deprecated-since_Oct_2023-red) [![Replaced by @signpdf/signpdf](https://img.shields.io/badge/replaced_by-@signpdf/signpdf-green)](https://github.com/vbuch/node-signpdf)

* The process of signing a document is described in the [Digital Signatures in PDF](https://www.adobe.com/devnet-docs/etk_deprecated/tools/DigSig/Acrobat_DigitalSignatures_in_PDF.pdf) document. As Adobe's files are deprecated, [here is the standard as defined by ETSI](<https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/Standards+and+specifications#Standardsandspecifications-PAdES(PDFAdvancedElectronicSignature)BaselineProfile>).
* This lib:
  * requires the [signature placeholder](#append-a-signature-placeholder) to already be in the document (There are helpers included that can try to add it);
  * requires the `Contents` descriptor in the `Sig` be placed after the `ByteRange` one;
  * takes `Buffer`s of the PDF and a P12 certificate to use when [signing](#generate-and-apply-signature);
  * does cover only basic scenarios of signing a PDF. If you have suggestions, ideas or anything, please [CONTRIBUTE](#contributing);
* Feel free to copy and paste any part of this code. See its defined [Purpose](#purpose).

## Signing PDF in simple steps

### Generate a PDF

See the [unit-testing code](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js). PDFKit is used there for generating the document. This also allows easy addition of the signature placeholder.

### Append a signature placeholder

What's needed is a `Sig` element and a `Widget` that is also linked in a `Form`. The form needs to be referenced in the root descriptor of the PDF as well. A (hopefully) [readable sample](https://github.com/vbuch/node-signpdf/blob/master/src/helpers/pdfkitAddPlaceholder.js) is available in the helpers. Note the `Contents` descriptor of the `Sig` where zeros are placed that will later be replaced with the actual signature.

This package provides two [helpers](https://github.com/vbuch/node-signpdf/blob/master/src/helpers/index.js) for adding the signature placeholder:

* pdfkitAddPlaceholder
* plainAddPlaceholder

**Note:** Signing in detached mode makes the signature length independent of the PDF's content length, but it may still vary between different signing certificates. So every time you sign using the same P12 you will get the same length of the output signature, no matter the length of the signed content. It is safe to find out the actual signature length your certificate produces and use it to properly configure the placeholder length.

#### PAdES compliant signatures

To produce PAdES compliant signatures, the ETSI Signature Dictionary SubFilter value must be `ETSI.CAdES.detached` instead of the standard Adobe value.

This can be declared using the subFilter option argument passed to `pdfkitAddPlaceholder` and `plainAddPlaceholder`.

```js
import { SUBFILTER_ETSI_CADES_DETACHED, pdfkitAddPlaceholder } from 'node-signpdf';

const pdfToSign = pdfkitAddPlaceholder({
  ...,
  subFilter: SUBFILTER_ETSI_CADES_DETACHED,
});
```

### Generate and apply signature

That's where the Signer kicks in. Given a PDF and a P12 certificate a signature is generated in detached mode and is replaced in the placeholder. This is best demonstrated in [the tests](https://github.com/vbuch/node-signpdf/blob/master/src/signpdf.test.js#L122).

## Dependencies

[node-forge](https://github.com/digitalbazaar/forge) is used for working with signatures.

[PDFKit](https://github.com/foliojs/pdfkit) is used in the tests for generating a PDF with a signature placeholder.

## Credits

* The whole signing flow is a rework of what's already [in pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js/blob/master/src/js/main.js#L594) so thanks go to [@tbocek](https://github.com/tbocek)
* [node-forge](https://github.com/digitalbazaar/forge) is an awesome package written in pure JavaScript and [supports signing in detached mode](https://github.com/digitalbazaar/forge/pull/605). Many thanks to all the guys who wrote and maintain it.
* Thanks to the guys of [PDFKit](https://github.com/foliojs/pdfkit) as well. They've made PDF generation incredibly easy.

## `node-signpdf` is ![deprecated since Oct 2023](https://img.shields.io/badge/deprecated-since_Oct_2023-red) and is being [![replaced by @signpdf/signpdf](https://img.shields.io/badge/replaced_by-@signpdf/signpdf-green)](https://github.com/vbuch/node-signpdf)