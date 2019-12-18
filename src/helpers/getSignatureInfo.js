import forge from 'node-forge'
import SignPdfError from '../SignPdfError'

const { pki } = forge

const getSignatureInfo = (buffer, password = undefined) => {
  try {
    const p12Buffer = buffer.toString('base64')
    const p12Der = forge.util.decode64(p12Buffer)
    const p12Asn1 = forge.asn1.fromDer(p12Der)
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password || '')
    const bagkey = pki.oids.pkcs8ShroudedKeyBag
    const pkcs8Bags2 = p12.getBags({ bagType: bagkey })
    const keyObject = pkcs8Bags2[bagkey][0].key
    const localKeyId = pkcs8Bags2[bagkey][0].attributes.localKeyId
    const key = pki.privateKeyToPem(keyObject)
    const certBags = p12.getBags({
      bagType: pki.oids.certBag, localKeyId: localKeyId[0]
    })
    const cert = certBags.localKeyId[0].cert
    return cert.subject.getField('CN').value
  } catch (e) {
    throw new SignPdfError(e.message, SignPdfError.VERIFY_SIGNATURE)
  }
}

export default getSignatureInfo
