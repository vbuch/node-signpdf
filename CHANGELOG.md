# CHANGELOG

## [3.2.3]

* [examples] Run linting on examples;
* [placeholder-plain] Fix ability to add a placeholder to a file that contains the "trailer" keyword in plain text;
* Bumped version of ip, punycode and sshpk.

## [3.2.2]

* Zero-change version. Lerna versioning was messed up with `lerna publish from-package`.

## [3.2.1]

* [signer-p12] Fixed JSDoc on the sign() method.

## [3.2.0]

* [utils] Introduced `convertBuffer()` to allow inputs as `Buffer`, `Uint8Array` or `string`;
* [utils] The `Signer` abstract class accepts an optional `signingTime`;
* [utils] `removeTrailingNewLine` would works for files with `\r`, `\n` or `\r\n`;

* [signpdf] Accepts `Buffer`, `Uint8Array` or `string` as input;

* [signer-p12] Accepts `Buffer`, `Uint8Array` or `string` as input;
* [signer-p12] Respects `signingTime` as abstracted in `Signer`;

* [placeholder-pdf-lib] Accepts either a `PDFDoc` or a `PDFPage` to allow adding the placeholder to a specific page rather than always the first one;
* [placeholder-pdf-lib] Accepts `signingTime`;
* [placeholder-pdf-lib] Includes an `AP` appearance stream for PDF/A compliance;
* [placeholder-pdf-lib] Accepts `appName` and includes it in `Prop_Build` to allow describing the signing application;
* [placeholder-pdf-lib] Does not require `{useObjectStreams: false}`;

* [placeholder-pdfkit] Accepts `signingTime`;
* [placeholder-pdfkit] Accepts `appName` and includes it in `Prop_Build` to allow describing the signing application;

* [placeholder-pdfkit010] Accepts `signingTime`;
* [placeholder-pdfkit010] Accepts `appName` and includes it in `Prop_Build` to allow describing the signing application;

* [placeholder-plain] Accepts `signingTime`;
* [placeholder-plain] Accepts `appName` and includes it in `Prop_Build` to allow describing the signing application;

* Bumped version of follow-redirects;

## [3.1.0]

* [placeholder-pdfkit] Introduce the package that uses PDFKit > 0.10 for adding a placeholder;

## [3.1.0]

* [utils] Added `SIG_FLAGS` and `ANNOTATION_FLAGS` to improve readability;
* [utils] Reworked `findByteRange` to match in more cases where it was incompatible so far (it didn't allow optional spaces in the array).
* [placeholder-pdfkit010] Uses `SIG_FLAGS` and `ANNOTATION_FLAGS` instead of magic numbers;
* [placeholder-pdfkit010] Allow passing in `widgetRect` to override the default `[0, 0, 0, 0]` one;
* [placeholder-plain] Allow passing in `widgetRect` to override the default `[0, 0, 0, 0]` one;
* [placeholder-pdf-lib] Introduce the package that uses PDF-LIB for adding a placeholder;
* [signpdf] Use the BR position `findByteRange` provides to spare a search for it;
* [signpdf] Reexports the `Signer` base (abstract) class and `SignPdfError`;
* [examples] Introduce [an example that provides a visible widget](packages/examples/src/pdfkit010-with-visual.js) (implemented with pdfkit);
* [examples] Introduce [a `placeholder-pdf-lib` example](packages/examples/src/pdf-lib.js);
* Bumped version of axios;

## [3.0.0]

* Deprecating `node-signpdf` to be replaced by the `@signpdf` scoped packages;
* Split the helpers into separate packages `@signpdf/placeholder-pdfkit010` and `@signpdf/placeholder-plain`;
* Decoupled the signing algorythm and the PDF signing process. Now `@signpdf/signpdf` understands PDFs and `@signpdf/signer-p12` understands P12 and `node-forge`;
* sign() is now async to allow for hooking different signers;
* placeholder helpers now require `contactInfo`, `location` and `name` which used to be optional;
* Introduced examples in `packages/examples`;
* Introduced more types declarations through TS and JSDoc;

## [2.0.0]

* Only publish dist files into npm (see https://bit.ly/46rykd7 on why this requires a major version);
* Produce and publish .d.ts;
* Bumped versions of semver and word-wrap;

## [1.5.1]

* Reorder authenticatedAttributes so that EU's verification passes;

## [1.5.0]

* Reworked reading xref table;
* Shifted minimum Node from 10 to 12;
* Added Husky;
* Upgraded dependencies;

## [1.4.1]

* Added support for overriding signature SubFilter value allowing the creation of PAdES compliant signatures;
* Added linting to CI;
* Bump dependencies;
* Removed Travis integration in favor of GitHub Actions;

## [1.3.3]

* plainAddPlaceholder: Fixed loss of PDF metadata when adding placeholder;
* Export helpers from root;
* Bumped dependencies;

## [1.3.2]

* Fixed detection of ByteRange (including when it is a placeholder);
* Bumped node-forge version;

## [1.3.0]

* Allow pdfkitAddPlaceholder to receive custom location, contactInfo, name;
* Fixed duplicate startxref in some PDFs;
* Fixed AcroForm ID extraction;
* Updated dependencies;

## [1.2.3]

* Fixed the opposite of 1.2.2's fix: adding placeholder failed when there were no previous /Annots.

## [1.2.2]

* Fixed an issue in plainAddPlaceholder that used to fail when the source PDF already contained /Annots.

## [1.2.1]

* Fixed the logo for display in npmjs.com.

## [1.2.0]

* `removeTrailingNewLine` removes both `\r` and `\n`.
* Simplified regex that finds page dictionary ref.
* Introduced the logo.

## [1.1.0]

* `plainAddPlaceholder` creates an incremental change to allow signing a document multiple times.

## [1.0.1, 1.0.2]

* Republish to fix messed up `latest` tag

## [1.0.0]

* Removed signature verification as it is an incomplete implementation
* Split helpers as they became a huge piece of code
* Renamed `addSignaturePlaceholder` to `pdfkitAddPlaceholder`
* Implemented `plainAddPlaceholder` that works without pdfkit but with string/Buffer operations instead
* Started this CHNAGELOG
* Switched from npm to yarn
* Upgraded dependencies due to vulnerabilities

## [0.3.2]

* Fixed the ByteRange-matching regex

## [0.3.1]

* Fixed ByteRange logic in extractSignature
* Updated the way the page dictionary is refernced to make it work with both pdfkit 0.8 and 0.9
* Upgraded dependencies due to vulnerabilities

## [0.3.0]

* Added signature verification
* Extracted helpers out to make them reusable
