import PDFKitReferenceMock from './pdfkitReferenceMock'
import { DEFAULT_BYTE_RANGE_PLACEHOLDER, DEFAULT_SIGNATURE_LENGTH } from './const'
import {
  PDFDocument,
  StandardFonts,
  PDFCatalog,
  PDFWriter,
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
  signatureLength = signatureLength * 2
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
  const date = new Date()
  const arrayByteRange = PDFArray.withContext(pdfDoc.context)
  arrayByteRange.push(PDFNumber.of(0))
  arrayByteRange.push(PDFName.of(byteRangePlaceholder))
  arrayByteRange.push(PDFName.of(byteRangePlaceholder))
  arrayByteRange.push(PDFName.of(byteRangePlaceholder))
  const signatureDictMap = new Map()
  signatureDictMap.set(PDFName.Type, PDFName.of('Sig'))
  signatureDictMap.set(PDFName.of('Filter'), PDFName.of('Adobe.PPKLite'))
  signatureDictMap.set(PDFName.of('SubFilter'), PDFName.of('adbe.pkcs7.detached'))
  signatureDictMap.set(PDFName.of('ByteRange'), arrayByteRange)
  signatureDictMap.set(
    PDFName.of('Contents'),
    PDFHexString.of('0'.repeat(signatureLength))
  )
  signatureDictMap.set(PDFName.of('Reason'), PDFString.of(infoSignature.reason))
  signatureDictMap.set(PDFName.of('M'), PDFString.fromDate(date))
  signatureDictMap.set(
    PDFName.of('ContactInfo'),
    PDFString.of(infoSignature.contactInfo || '')
  )
  signatureDictMap.set(PDFName.of('Name'), PDFString.of(infoSignature.name || ''))
  signatureDictMap.set(PDFName.of('Location'), PDFString.of(infoSignature.location || ''))
  const signatureDict = PDFDict.fromMapWithContext(signatureDictMap, pdfDoc.context)

  // Check if pdf already contains acroform field
  pdfBuffer = Buffer.from(pdfBuffer, 'base64')
  const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm')
  const isAcroFormExists = acroFormPosition !== -1
  let fieldIds = []
  let acroFormId
  if (isAcroFormExists) {
    const pdfSlice = pdfBuffer.slice(acroFormPosition - 12)
    const acroForm = pdfBuffer.slice(0, pdfSlice.indexOf('endobj')).toString()
    const acroFormFirsRow = acroForm.split('\n')[0]
    acroFormId = parseInt(acroFormFirsRow.split(' ')[0])
    const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 10, acroForm.indexOf(']') - 1)
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
  
  const sigAppearanceStreamMapDict = new Map()
  const FontHelvetica = pdfDoc.embedStandardFont(StandardFonts.Helvetica)
  const resourcesMap = new Map()
  resourcesMap.set(PDFName.Font, PDFName.of('Helvetica'))
  sigAppearanceStreamMapDict.set(
    PDFName.of('Resources'),
    PDFDict.fromMapWithContext(resourcesMap, pdfDoc.context)
  )
  sigAppearanceStreamMapDict.set(PDFName.Type, PDFName.XObject)
  sigAppearanceStreamMapDict.set(PDFName.of('Subtype'), PDFName.of('Form'))
  
  // Define a content stream that defines how the signature field should appear
  // on the PDF. - Table 95 of the PDF specification.
  const sigAppearanceStream = PDFContentStream.of(
    PDFDict.fromMapWithContext(sigAppearanceStreamMapDict, pdfDoc.context),
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
    })
  )
  drawText(info, {
    x: PDFNumber.of(10),
    y: PDFNumber.of(15),
    font: 'Helvetica',
    size: PDFNumber.of(15),
    color: rgb(0.5, 0.5, 0.5),
    rotate: degrees(0),
    xSkew: degrees(0),
    ySkew: degrees(0)
  }).forEach(x => { sigAppearanceStream.push(x) })
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
  }).forEach(x => { sigAppearanceStream.push(x) })
  const sigAppearanceStreamRef = pdfDoc.context.register(sigAppearanceStream)

  const signatureDictRef = pdfDoc.context.register(signatureDict)
  // Define the signature widget annotation - Table 164
  const widgetDictMap = new Map()
  const APMap = new Map()
  const arrayRect = PDFArray.withContext(pdfDoc.context)
  arrayRect.push(PDFNumber.of(50))
  arrayRect.push(PDFNumber.of(50))
  arrayRect.push(PDFNumber.of(300))
  arrayRect.push(PDFNumber.of(100))
  APMap.set(PDFName.of('N'), sigAppearanceStreamRef)
  
  widgetDictMap.set(PDFName.Type, PDFName.of('Annot'))
  widgetDictMap.set(PDFName.of('Subtype'), PDFName.of('Widget'))
  widgetDictMap.set(PDFName.of('FT'), PDFName.of('Sig'))
  widgetDictMap.set(PDFName.of('Rect'), arrayRect)
  widgetDictMap.set(PDFName.of('V'), signatureDictRef)
  widgetDictMap.set(PDFName.of('T'), PDFString.of(signatureName + (fieldIds.length + 1)))
  widgetDictMap.set(PDFName.of('F'), PDFNumber.of(4))
  widgetDictMap.set(PDFName.of('P'), pdfDoc.catalog.Pages().Kids().get(0))
  widgetDictMap.set(PDFName.of('AP'), PDFDict.fromMapWithContext(APMap, pdfDoc.context))

  const widgetDict = PDFDict.fromMapWithContext(widgetDictMap, pdfDoc.context)
  const widgetDictRef = pdfDoc.context.register(widgetDict)

  // Add our signature widget to the first page
  // by parameter it should also be sent which pages you want to sign - ojo
  const pages = pdfDoc.getPages()
  const arrayAnnots = PDFArray.withContext(pdfDoc.context)
  arrayAnnots.push(widgetDictRef)
  pages[0].node.set(PDFName.Annots, arrayAnnots)
  
  // Create an AcroForm object containing our signature widget
  // const formDictMap = new Map()
  // const arrayFields = PDFArray.withContext(pdfDoc.context)
  // arrayFields.push(widgetDictRef)
  // formDictMap.set(PDFName.Type, PDFName.of('AcroForm'))
  // formDictMap.set(PDFName.of('SigFlags'), PDFNumber.of(3))
  // formDictMap.set(PDFName.of('Fields'), arrayFields)
  // const formDict = PDFDict.fromMapWithContext(formDictMap, pdfDoc.context)
  // const formDictRef = pdfDoc.context.register(formDict)
  // 
  // const catalogMap = pdfDoc.catalog.dict.set(PDFName.of('AcroForm'), formDictRef)

  pdfDoc.catalog.set(
    PDFName.of('AcroForm'),
    pdfDoc.context.obj({
      SigFlags: 3,
      Fields: [widgetDictRef],
    }),
  )

  let pdfDocBytes = await PDFWriter.forContext(pdfDoc.context).serializeToBuffer()

  // Delete spaces in ByteRange
  pdfDocBytes = Buffer.from(pdfDocBytes)
  const byteRangePlaceholderContent = [
    0,
    `/${byteRangePlaceholder}`,
    `/${byteRangePlaceholder}`,
    `/${byteRangePlaceholder}`
  ]
  const byteRangeString = `/ByteRange [ ${byteRangePlaceholderContent.join(' ')} ]`
  let actualByteRange = `/ByteRange [${byteRangePlaceholderContent.join(' ')}]`
  actualByteRange += '  '
  const byteRangePos = pdfDocBytes.indexOf(byteRangeString)
  if (byteRangePos !== -1) {
    const byteRangeEnd = byteRangePos + byteRangeString.length
    pdfDocBytes = Buffer.concat([
      pdfDocBytes.slice(0, byteRangePos),
      Buffer.from(actualByteRange),
      pdfDocBytes.slice(byteRangeEnd),
    ])
  }
  return Buffer.from(pdfDocBytes)
}

export default pdflibAddPlaceholder
