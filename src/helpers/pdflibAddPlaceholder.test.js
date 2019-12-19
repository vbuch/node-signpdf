import fs from 'fs'
import SignPdfError from '../SignPdfError'
import pdflibAddPlaceholder from './pdflibAddPlaceholder'

describe('pdflib add placeholder', () => {
  it('add mark to document', async () => {
    try {
      let pdfBuffer = fs.readFileSync(`${__dirname}/../../resources/w3dummy.pdf`)
      const infoSignature = {
        reason: 'Sign Test',
        contactInfo: 'example123@gmail.com',
        name: 'Name Example',
        location: 'Location Example',
      }
      pdfBuffer = await pdflibAddPlaceholder({pdfBuffer, infoSignature})
      expect(pdfBuffer instanceof Buffer).toBe(true)
    } catch (e) {
      console.log('error', e)
      expect(e instanceof SignPdfError).toBe(true)
      expect(e.type).toBe(SignPdfError.TYPE_PARSE)
    }
  })
})
