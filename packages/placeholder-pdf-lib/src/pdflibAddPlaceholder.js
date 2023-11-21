import {
    ANNOTATION_FLAGS,
    DEFAULT_BYTE_RANGE_PLACEHOLDER,
    DEFAULT_SIGNATURE_LENGTH,
    SIG_FLAGS,
    SUBFILTER_ADOBE_PKCS7_DETACHED,
} from '@signpdf/utils';
import {
    PDFArray, PDFDict, PDFHexString, PDFName, PDFNumber, PDFString,
} from 'pdf-lib';

/**
 * @typedef {import('pdf-lib').PDFDocument} PDFDocument
 */

/**
* @typedef {object} InputType
* @property {PDFDocument} pdfDoc
* @property {string} reason
* @property {string} contactInfo
* @property {string} name
* @property {string} location
* @property {number} [signatureLength]
* @property {string} [byteRangePlaceholder]
* @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
* @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
*/

/**
 * Adds a signature placeholder to a PDF-LIB PDFDocument.
 *
 * Alters the passed pdfDoc and returns void.
 *
 * @param {InputType}
 * @returns {void}
 */
export const pdflibAddPlaceholder = ({
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
    const page = pdfDoc.getPage(0);

    // Create a placeholder where the the last 3 parameters of the
    // actual range will be replaced when signing is done.
    const byteRange = PDFArray.withContext(pdfDoc.context);
    byteRange.push(PDFNumber.of(0));
    byteRange.push(PDFName.of(byteRangePlaceholder));
    byteRange.push(PDFName.of(byteRangePlaceholder));
    byteRange.push(PDFName.of(byteRangePlaceholder));

    // Fill the contents of the placeholder with 00s.
    const placeholder = PDFHexString.of(String.fromCharCode(0).repeat(signatureLength));

    // Create a signature dictionary to be referenced in the signature widget.
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
    const signatureDictRef = pdfDoc.context.register(signatureDict);

    // Create the signature widget
    const rect = PDFArray.withContext(pdfDoc.context);
    widgetRect.forEach((c) => rect.push(PDFNumber.of(c)));
    const widgetDict = pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: rect,
        V: signatureDictRef,
        T: PDFString.of('Signature1'),
        F: ANNOTATION_FLAGS.PRINT,
        P: page.ref,
    }, pdfDoc.index);
    const widgetDictRef = pdfDoc.context.register(widgetDict);

    // Annotate the widget on the first page
    let annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (typeof annotations === 'undefined') {
        annotations = pdfDoc.context.obj([]);
    }
    annotations.push(widgetDictRef);
    page.node.set(PDFName.of('Annots'), annotations);

    // Add an AcroForm or update the existing one
    let acroForm = pdfDoc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
    if (typeof acroForm === 'undefined') {
        // Need to create a new AcroForm
        acroForm = pdfDoc.context.obj({Fields: []});
        const acroFormRef = pdfDoc.context.register(acroForm);
        pdfDoc.catalog.set(PDFName.of('AcroForm'), acroFormRef);
    }

    /**
     * @type {PDFNumber}
     */
    let sigFlags;
    if (acroForm.has(PDFName.of('SigFlags'))) {
        // Already has some flags, will merge
        sigFlags = acroForm.get(PDFName.of('SigFlags'));
    } else {
        // Create blank flags
        sigFlags = PDFNumber.of(0);
    }
    const updatedFlags = PDFNumber.of(
        sigFlags.asNumber() | SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
    );
    acroForm.set(PDFName.of('SigFlags'), updatedFlags);
    const fields = acroForm.get(PDFName.of('Fields'));
    fields.push(widgetDictRef);
};
