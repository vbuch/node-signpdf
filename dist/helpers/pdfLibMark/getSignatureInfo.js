"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeForge = _interopRequireDefault(require("node-forge"));

var _SignPdfError = _interopRequireDefault(require("../../SignPdfError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  pki
} = _nodeForge.default;

const getSignatureInfo = (buffer, password = undefined) => {
  try {
    const p12Buffer = buffer.toString('base64');

    const p12Der = _nodeForge.default.util.decode64(p12Buffer);

    const p12Asn1 = _nodeForge.default.asn1.fromDer(p12Der);

    const p12 = _nodeForge.default.pkcs12.pkcs12FromAsn1(p12Asn1, password || '');

    const bagkey = pki.oids.pkcs8ShroudedKeyBag;
    const pkcs8Bags2 = p12.getBags({
      bagType: bagkey
    });
    const keyObject = pkcs8Bags2[bagkey][0].key;
    const localKeyId = pkcs8Bags2[bagkey][0].attributes.localKeyId;
    const key = pki.privateKeyToPem(keyObject);
    const certBags = p12.getBags({
      bagType: pki.oids.certBag,
      localKeyId: localKeyId[0]
    });
    const cert = certBags.localKeyId[0].cert;
    return cert.subject.getField('CN').value;
  } catch (e) {
    throw new _SignPdfError.default(e.message, _SignPdfError.default.VERIFY_SIGNATURE);
  }
};

var _default = getSignatureInfo;
exports.default = _default;