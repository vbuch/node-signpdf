import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import SignPdfError from '../../SignPdfError'

const addMarkToDocument = async (pdfBuffer, text) => {
  let pdfDoc
  try {
    pdfBuffer = Buffer.from(pdfBuffer).toString('base64')
    pdfDoc = await PDFDocument.load(pdfBuffer)
  } catch (err) {
    if (err.message.includes('encrypted')) {
      throw new SignPdfError('Problem loading PDF, PDF encrypted', SignPdfError.TYPE_PARSE)
    } else {
      throw err
    }
  }
  const pages = pdfDoc.getPages()
  let textForPDF = text.replace(/(?![^\n]{1,30}$)([^\n]{1,30})\s/g, '$1\n')
  textForPDF += `\nDate: ${(new Date()).toLocaleString()}`
  const { width, height } = pages[0].getSize()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawOptions = {
    size: 10,
    lineHeight: 12,
    x: 50,
    y: 50,
  }
  pages.forEach(page => {
    page.drawText(textForPDF, drawOptions)
  })
  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}

export default addMarkToDocument
