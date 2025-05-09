import {
    ANNOTATION_FLAGS,
    DEFAULT_BYTE_RANGE_PLACEHOLDER,
    DEFAULT_SIGNATURE_LENGTH,
    SIG_FLAGS,
    SUBFILTER_ADOBE_PKCS7_DETACHED,
    SignPdfError,
} from '@signpdf/utils';
import {
    PDFArray, PDFHexString, PDFName, PDFNumber, PDFInvalidObject, PDFString,
} from '@adnsistemas/pdf-lib';

/**
 * @typedef {import('@adnsistemas/pdf-lib').PDFDocument} PDFDocument
 */

/**
 * @typedef {import('@adnsistemas/pdf-lib').PDFPage} PDFPage
 */

/**
 * @typedef {( pdfDoc,
 *             pdfPage,
 *             reason,
 *             contactInfo,
 *             name,
 *             location,
 *             signingTime) => void} signaturePDFLibVisualRep
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
 * @property {string} [widgetName] Name to use for the Widget representing the signature,
 *  'Signature1' if not specified
 * @property {string} [signDescription] Descriptive texto to show for widget on visualization,
 *  instead of widgetName
 * @property {number[]} [newPageDims] If not specified page[0] is used for signature,
 *  otherwise a new page, with this dimensiones is used
 * @property {signaturePDFLibVisualRep} [visualRepresentation] If provided,
 *  and new page is generated, is invoked to put the visual representation of the signature,
 *  on the new page
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
    widgetName = undefined,
    signDescription = undefined,
    newPageDims = undefined,
    visualRepresentation = undefined,
}) => {
    if (pdfDoc === undefined && pdfPage === undefined) {
        throw new SignPdfError(
            'PDFDoc or PDFPage must be set.',
            SignPdfError.TYPE_INPUT,
        );
    }
    const doc = pdfDoc ?? pdfPage.doc;
    const page = pdfPage ?? (newPageDims ? doc.addPage(newPageDims) : doc.getPages()[0]);
    const timeStamp = signingTime ?? new Date();
    if (newPageDims && visualRepresentation) {
        visualRepresentation(doc, page, reason, contactInfo, name, location, timeStamp);
    }
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
        M: PDFString.fromDate(timeStamp),
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
        T: PDFString.of(widgetName ?? 'Signature1'),
        F: ANNOTATION_FLAGS.PRINT,
        P: page.ref,
        AP: {N: doc.context.register(apStream)}, // Required for PDF/A compliance
    });
    if (signDescription) {
        widgetDict.set(PDFName.of('TU'), PDFString.of(signDescription));
    }
    const widgetDictRef = doc.context.register(widgetDict);

    // Annotate the widget on the given page
    let annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (typeof annotations === 'undefined') {
        annotations = doc.context.obj([]);
    }
    annotations.push(widgetDictRef);
    page.node.set(PDFName.of('Annots'), annotations);

    // Add an AcroForm or update the existing one
    const acroForm = doc.catalog.getOrCreateAcroForm();

    /**
     * @type {PDFNumber}
     */
    let sigFlags;
    if (acroForm.dict.has(PDFName.of('SigFlags'))) {
        // Already has some flags, will merge
        sigFlags = acroForm.dict.get(PDFName.of('SigFlags'));
    } else {
        // Create blank flags
        sigFlags = PDFNumber.of(0);
    }
    const updatedFlags = PDFNumber.of(
        sigFlags.asNumber() | SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
    );
    acroForm.dict.set(PDFName.of('SigFlags'), updatedFlags);
    let fields = acroForm.dict.get(PDFName.of('Fields'));
    if (!(fields instanceof PDFArray)) {
        fields = doc.context.obj([]);
        acroForm.dict.set(PDFName.of('Fields'), fields);
    }
    fields.push(widgetDictRef);
};
