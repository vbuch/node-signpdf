import {
    ANNOTATION_FLAGS,
    DEFAULT_BYTE_RANGE_PLACEHOLDER,
    DEFAULT_SIGNATURE_LENGTH,
    SIG_FLAGS,
    SUBFILTER_ADOBE_PKCS7_DETACHED,
    SignPdfError,
} from '@signpdf/utils';
import {
    PDFArray, PDFDict, PDFHexString, PDFName, PDFNumber, PDFInvalidObject, PDFString,
} from 'pdf-lib';

/**
 * @typedef {import('pdf-lib').PDFDocument} PDFDocument
 */

/**
 * @typedef {import('pdf-lib').PDFPage} PDFPage
 */

/**
 * @typedef {object} CommonInputType
 * @property {PDFDocument} [pdfDoc]
 * @property {PDFPage} [pdfPage]
 * @property {string} reason
 * @property {string} contactInfo
 * @property {string} name
 * @property {string} location
 * @property {Date} [signingTime]
 * @property {number} [signatureLength]
 * @property {string} [byteRangePlaceholder]
 * @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
 * @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
 * @property {string} [appName] Name of the application generating the signature
 */

/**
* @typedef {object} DocInputType
* @property {PDFDocument} pdfDoc
*/

/**
* @typedef {object} PageInputType
* @property {PDFPage} pdfPage
*/

/**
* @typedef {CommonInputType & (DocInputType | PageInputType)} InputType
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
    pdfDoc = undefined,
    pdfPage = undefined,
    reason,
    contactInfo,
    name,
    location,
    signingTime = undefined,
    signatureLength = DEFAULT_SIGNATURE_LENGTH,
    byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
    subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
    widgetRect = [0, 0, 0, 0],
    appName = undefined,
}) => {
    if (pdfDoc === undefined && pdfPage === undefined) {
        throw new SignPdfError(
            'PDFDoc or PDFPage must be set.',
            SignPdfError.TYPE_INPUT,
        );
    }
    const doc = pdfDoc ?? pdfPage.doc;
    const page = pdfPage ?? doc.getPages()[0];

    // Create a placeholder where the the last 3 parameters of the
    // actual range will be replaced when signing is done.
    const byteRange = PDFArray.withContext(doc.context);
    byteRange.push(PDFNumber.of(0));
    byteRange.push(PDFName.of(byteRangePlaceholder));
    byteRange.push(PDFName.of(byteRangePlaceholder));
    byteRange.push(PDFName.of(byteRangePlaceholder));

    // Fill the contents of the placeholder with 00s.
    const placeholder = PDFHexString.of(String.fromCharCode(0).repeat(signatureLength));

    // Create a signature dictionary to be referenced in the signature widget.
    const appBuild = appName ? {App: {Name: appName}} : {};
    const signatureDict = doc.context.obj({
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: subFilter,
        ByteRange: byteRange,
        Contents: placeholder,
        Reason: PDFString.of(reason),
        M: PDFString.fromDate(signingTime ?? new Date()),
        ContactInfo: PDFString.of(contactInfo),
        Name: PDFString.of(name),
        Location: PDFString.of(location),
        Prop_Build: {
            Filter: {Name: 'Adobe.PPKLite'},
            ...appBuild,
        },
    });
    // Register signatureDict as a PDFInvalidObject to prevent PDFLib from serializing it
    // in an object stream.
    const signatureBuffer = new Uint8Array(signatureDict.sizeInBytes());
    signatureDict.copyBytesInto(signatureBuffer, 0);
    const signatureObj = PDFInvalidObject.of(signatureBuffer);
    const signatureDictRef = doc.context.register(signatureObj);

    // Create the signature widget
    const rect = PDFArray.withContext(doc.context);
    widgetRect.forEach((c) => rect.push(PDFNumber.of(c)));
    const apStream = doc.context.formXObject([], {
        BBox: widgetRect,
        Resources: {}, // Necessary to avoid Acrobat bug (see https://stackoverflow.com/a/73011571)
    });
    const widgetDict = doc.context.obj({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: rect,
        V: signatureDictRef,
        T: PDFString.of('Signature1'),
        F: ANNOTATION_FLAGS.PRINT,
        P: page.ref,
        AP: {N: doc.context.register(apStream)}, // Required for PDF/A compliance
    });
    const widgetDictRef = doc.context.register(widgetDict);

    // Annotate the widget on the given page
    let annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (typeof annotations === 'undefined') {
        annotations = doc.context.obj([]);
    }
    annotations.push(widgetDictRef);
    page.node.set(PDFName.of('Annots'), annotations);

    // Add an AcroForm or update the existing one
    let acroForm = doc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
    if (typeof acroForm === 'undefined') {
        // Need to create a new AcroForm
        acroForm = doc.context.obj({Fields: []});
        const acroFormRef = doc.context.register(acroForm);
        doc.catalog.set(PDFName.of('AcroForm'), acroFormRef);
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
    let fields = acroForm.get(PDFName.of('Fields'));
    if (!(fields instanceof PDFArray)) {
        fields = doc.context.obj([]);
        acroForm.set(PDFName.of('Fields'), fields);
    }
    fields.push(widgetDictRef);
};
