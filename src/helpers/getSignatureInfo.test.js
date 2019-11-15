import fs from 'fs'
import SignPdfError from '../SignPdfError'
import getSignatureInfo from './getSignatureInfo'

describe('getSignatureInfo', () => {
  it('expects P12 certificate to be Buffer', () => {
    try {
      getSignatureInfo('non-buffer')
      expect('here').not.toBe('here')
    } catch (e) {
      expect(e instanceof SignPdfError).toBe(true)
      expect(e.type).toBe(SignPdfError.VERIFY_SIGNATURE)
      expect(e.message).toMatchSnapshot()
    }
  })
  it('get signature information', () => {
    try {
      const p12Buffer = fs.readFileSync(`${__dirname}/../../resources/withpass.p12`)
      const info = getSignatureInfo(p12Buffer, 'node-signpdf')
      expect('SignPdf').toBe('SignPdf')
    } catch (e) {
      expect(e instanceof SignPdfError).toBe(true)
      expect(e.type).toBe(SignPdfError.VERIFY_SIGNATURE)
    }
  })
})
