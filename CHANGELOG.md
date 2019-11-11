# CHANGELOG

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
