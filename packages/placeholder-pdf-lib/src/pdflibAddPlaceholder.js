import {DEFAULT_BYTE_RANGE_PLACEHOLDER, DEFAULT_SIGNATURE_LENGTH, SUBFILTER_ADOBE_PKCS7_DETACHED} from '@signpdf/utils';
import {
    PDFArray, PDFHexString, PDFName, PDFNumber, PDFString, toHexStringOfMinLength,
} from 'pdf-lib';

/**
 * @typedef {import('pdf-lib').PDFDocumentFactory} PDFDocumentFactory
 */

/**
* @typedef {object} InputType
* @property {PDFDocumentFactory} pdfDoc
* @property {string} reason
* @property {string} contactInfo
* @property {string} name
* @property {string} location
* @property {number} [signatureLength]
* @property {string} [byteRangePlaceholder]
* @property {string} [subFilter] One of SUBFILTER_* from @signpdf/utils
* @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
*/

/**
 * @param {InputType}
 * @returns {Buffer}
 */
export const pdflibAddPlaceholder = async ({
    pdfDoc,
    reason,
    contactInfo,
    name,
    location,
    signatureLength = DEFAULT_SIGNATURE_LENGTH,
    byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
    subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
    widgetRect = [0, 0, 0, 0],
}) => {
    const pages = pdfDoc.getPages();

    const byteRange = PDFArray.withContext(pdfDoc.context);
    byteRange.push(PDFNumber.of(0));
    byteRange.push(PDFString.of(byteRangePlaceholder));
    byteRange.push(PDFString.of(byteRangePlaceholder));
    byteRange.push(PDFString.of(byteRangePlaceholder));

    const hexNull = toHexStringOfMinLength(0, 4);
    const placeholder = PDFHexString.of(hexNull.repeat(signatureLength));

    const signatureDict = pdfDoc.context.obj({
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: subFilter,
        ByteRange: byteRange,
        Contents: placeholder,
        Reason: PDFString.of(reason),
        M: PDFString.fromDate(new Date()),
        ContactInfo: PDFString.of(contactInfo),
        Name: PDFString.of(name),
        Location: PDFString.of(location),
    }, pdfDoc.index);

    const rect = PDFArray.withContext(pdfDoc.context);
    widgetRect.forEach((c) => rect.push(PDFNumber.of(c)));
    const widgetDict = pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: rect,
        V: signatureDict,
        T: PDFString.of('Signature1'),
        F: 4,
        P: pages[0].ref,
    }, pdfDoc.index);
    const widgetDictRef = pdfDoc.context.register(widgetDict);

    pages[0].node.set(
        PDFName.of('Annots'),
        pdfDoc.context.obj([widgetDictRef]),
    );

    pdfDoc.catalog.set(
        PDFName.of('AcroForm'),
        pdfDoc.context.obj({
            SigFlags: 3,
            Fields: [widgetDictRef],
        }),
    );

    const pdfBytes = await pdfDoc.save({useObjectStreams: false});
    return Buffer.from(pdfBytes);
};
