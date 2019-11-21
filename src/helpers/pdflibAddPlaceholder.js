import PDFKitReferenceMock from './pdfkitReferenceMock'
import { DEFAULT_BYTE_RANGE_PLACEHOLDER, DEFAULT_SIGNATURE_LENGTH } from './const'
import {
  PDFDocument,
  PDFDict,
  PDFName,
  PDFArray,
  PDFString,
  PDFNumber,
  PDFHexString,
  PDFContentStream,
  PDFContext,
  drawText,
  drawRectangle,
  drawOptions,
  degrees,
  rgb
} from 'pdf-lib'

const pdflibAddPlaceholder = async ({
  pdfBuffer,
  infoSignature,
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
}) => {
  let pdfDoc
  try {
    pdfBuffer = pdfBuffer.toString('base64')
    pdfDoc = await PDFDocument.load(pdfBuffer)
  } catch (err) {
    if (err.message.includes('encrypted')) {
      throw new SignPdfError('Problem loading PDF, PDF encrypted', SignPdfError.TYPE_PARSE)
    } else {
      throw err
    }
  }
  const FontHelvetica = pdfDoc.embedStandardFont('Helvetica')
  const date = new Date()
  const pad = (str, length) => (Array(length + 1).join('0') + str).slice(-length)
  const dateString = `D:${pad(date.getUTCFullYear(), 4)}` +
    pad(date.getUTCMonth() + 1, 2) + pad(date.getUTCDate(), 2) +
    pad(date.getUTCHours(), 2) + pad(date.getUTCMinutes(), 2) +
    pad(date.getUTCSeconds(), 2) + 'Z'
  // Table 252 of the PDF specification.
  const signatureDict = PDFDict.withContext({
    Type: PDFName.of('Sig'),
    Filter: PDFName.of('Adobe.PPKLite'),
    SubFilter: PDFName.of('adbe.pkcs7.detached'),
    ByteRange: PDFArray.withContext([
      PDFNumber.of(0),
      PDFNumber.of(byteRangePlaceholder),
      PDFNumber.of(byteRangePlaceholder),
      PDFNumber.of(byteRangePlaceholder),
    ]),
    Contents: PDFHexString.of(String.fromCharCode(0).repeat(signatureLength)),
    Reason: PDFString.of(infoSignature.reason),
    M: PDFString.of(dateString),
    ContactInfo: PDFString.of(infoSignature.contactInfo || ''),
    Name: PDFString.of(infoSignature.name || ''),
    Location: PDFString.of(infoSignature.location || ''),
  }, pdfDoc.context)
  
  // Check if pdf already contains acroform field
  const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm')
  const isAcroFormExists = acroFormPosition !== -1
  let fieldIds = []
  let acroFormId
  if (isAcroFormExists) {
    const pdfSlice = pdfBuffer.slice(acroFormPosition - 12)
    const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString()
    const acroFormFirsRow = acroForm.split('\n')[0]
    acroFormId = parseInt(acroFormFirsRow.split(' ')[0])
    const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'))
    fieldIds = acroFormFields
      .split(' ')
      .filter((element, index) => index % 3 === 0)
      .map(fieldId => new PDFKitReferenceMock(fieldId))
  }
  
  const signatureName = 'Signature'
  const info = (infoSignature.name || 'Signed') + '\n' + date.toISOString()
  if (!infoSignature.positionBBox || !infoSignature.positionBBox.left ||
      !infoSignature.positionBBox.bottom || !infoSignature.positionBBox.right ||
      !infoSignature.positionBBox.top ) {
    infoSignature.positionBBox = {
      left: 0,
      bottom: 0,
      right: 200,
      top: 50
    }
  }

  // Define a content stream that defines how the signature field should appear
  // on the PDF. - Table 95 of the PDF specification.
  const sigAppearanceStream = PDFContentStream.of(
    PDFDict.withContext({
      Type: PDFName.of('XObject'),
      Subtype: PDFName.of('Form'),
      Resources: PDFDict.withContext({
        Font: PDFDict.withContext({
          Helvetica: FontHelvetica
        }, pdfDoc.context)
      }, pdfDoc.context),
    }, pdfDoc.context),
    drawRectangle({
      x: PDFNumber.of(infoSignature.positionBBox.left),
      y: PDFNumber.of(infoSignature.positionBBox.bottom),
      width: PDFNumber.of(infoSignature.positionBBox.right),
      height: PDFNumber.of(infoSignature.positionBBox.top),
      color: rgb(0.95, 0.95, 0.95),
      borderWidth: 3,
      borderColor: rgb(0, 0, 0),
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0)
    }),
    drawText(info, {
      x: PDFNumber.of(10),
      y: PDFNumber.of(15),
      font: 'Helvetica',
      size: PDFNumber.of(15),
      color: rgb(0.5, 0.5, 0.5),
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0)
    }),
    drawRectangle({
      x: PDFNumber.of(4),
      y: PDFNumber.of(4),
      width: PDFNumber.of(192),
      height: PDFNumber.of(2),
      color: rgb(0.5, 0.5, 0.5),
      rotate: degrees(0),
      borderWidth: 0,
      borderColor: rgb(0, 0, 0),
      xSkew: degrees(0),
      ySkew: degrees(0)
    })
  )

  const sigAppearanceStreamRef = pdfDoc.context.register(sigAppearanceStream)

  // Define the signature widget annotation - Table 164
  const widgetDict = PDFDict.withContext({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Widget'),
    FT: PDFName.of('Sig'),
    Rect: PDFArray.withContext([
      PDFNumber.of(50),
      PDFNumber.of(50),
      PDFNumber.of(300),
      PDFNumber.of(100),
    ]),
    V: signatureDict,
    T: PDFString.of(signatureName + (fieldIds.length + 1)),
    F: PDFNumber.of(4),
    P: pdfDoc.catalog.Pages().Kids().get(0),
    AP: PDFDict.withContext({
      N: sigAppearanceStreamRef,
    }, pdfDoc.context)
  }, pdfDoc.context)
  
  const widgetDictRef = pdfDoc.context.register(widgetDict)
  // Add our signature widget to the first page
  // by parameter it should also be sent which pages you want to sign - ojo
  const pages = pdfDoc.getPages()
  pages[0].node.set(
    PDFName.of('Annots'),
    PDFArray.withContext([widgetDictRef]),
  )

  // Create an AcroForm object containing our signature widget
  const formDict = PDFDict.withContext({
    SigFlags: PDFNumber.of(3),
    Fields: PDFArray.withContext([widgetDictRef]),
  }, pdfDoc.context)
  
  pdfDoc.catalog.set(PDFName.of('AcroForm'), formDict)
  const pdfDocBytes = await pdfDoc.save()
  return Buffer.from(pdfDocBytes)
}

export default pdflibAddPlaceholder
