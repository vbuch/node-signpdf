# Signer base implementation with PKI.js

for [![@signpdf](https://raw.githubusercontent.com/vbuch/node-signpdf/master/resources/logo-horizontal.svg?sanitize=true)](https://github.com/vbuch/node-signpdf/)

[![npm version](https://badge.fury.io/js/@signpdf%2Fsigner.svg)](https://badge.fury.io/js/@signpdf%2Fsigner)
[![Donate to this project using Buy Me A Coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg)](https://buymeacoffee.com/vbuch)

Uses `PKI.js` to create a detached signature of a given `Buffer`.

## Usage

This is an abstract base implementation of the `Signer` and `ExternalSigner` classes. Use any of the available implementations (or subclass any of these classes yourself) to sign an actual PDF file. See for example the [P12Signer package](/packages/signer-p12) for signing with a PKCS#12 certificate bundle.

## Notes

* Make sure to have a look at the docs of the [@signpdf family of packages](https://github.com/vbuch/node-signpdf/).
* Feel free to copy and paste any part of this code. See its defined [Purpose](https://github.com/vbuch/node-signpdf#purpose).
