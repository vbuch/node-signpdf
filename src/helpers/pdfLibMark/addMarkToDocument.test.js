import fs from 'fs'
import SignPdfError from '../../SignPdfError'
import addMarkToDocument from './addMarkToDocument'

describe('addMarkToDocument', () => {
  it('add mark to document', async () => {
    try {
      let pdfBuffer = fs.readFileSync(`${__dirname}/../../../resources/w3dummy.pdf`)
      const buffer = await addMarkToDocument(pdfBuffer, 'Information P12')
      expect(buffer instanceof Buffer).toBe(true)
    } catch (e) {
      console.log('error: ', e)
      expect(e instanceof SignPdfError).toBe(true)
      expect(e.type).toBe(SignPdfError.TYPE_PARSE)
    }
  })
})
