import {DEFAULT_BYTE_RANGE_PLACEHOLDER, DEFAULT_SIGNATURE_LENGTH} from './const';
// eslint-disable-next-line import/no-unresolved
import PDFKitReferenceMock from './PDFKitReferenceMock';

/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {PDFDocument} pdf
 * @param {string} reason
 * @returns {object}
 */
const pdfkitAddPlaceholder = ({
    pdf,
    pdfBuffer,
    reason,
    signatureLength = DEFAULT_SIGNATURE_LENGTH,
    byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
}) => {
    /* eslint-disable no-underscore-dangle,no-param-reassign */
    // Generate the signature placeholder
    const signature = pdf.ref({
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: 'adbe.pkcs7.detached',
        ByteRange: [
            0,
            byteRangePlaceholder,
            byteRangePlaceholder,
            byteRangePlaceholder,
        ],
        Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
        Reason: new String(reason), // eslint-disable-line no-new-wrappers
        M: new Date(),
        ContactInfo: new String('vizi.csaba89@gmail.com'), // eslint-disable-line no-new-wrappers
        Name: new String('vizi.csaba89@gmail.com'), // eslint-disable-line no-new-wrappers
        Location: new String('Atlanta, GA, USA'), // eslint-disable-line no-new-wrappers
    });

    // Check if pdf already contains acroform field
    const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm');
    const isAcroFormExists = acroFormPosition !== -1;
    let fieldIds = [];
    let acroFormId;

    if (isAcroFormExists) {
        const pdfSlice = pdfBuffer.slice(acroFormPosition - 12);
        const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString();
        const acroFormFirsRow = acroForm.split('\n')[0];
        acroFormId = parseInt(acroFormFirsRow.split(' ')[0]);

        const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'));
        fieldIds = acroFormFields
            .split(' ')
            .filter((element, index) => index % 3 === 0)
            .map(fieldId => new PDFKitReferenceMock(fieldId));
    }
    const AP = pdf.ref({
        BBox: [
            10 * fieldIds.length,
            10 * fieldIds.length,
            10 * fieldIds.length + 40,
            10 * fieldIds.length + 40,
        ],
        Resources: '<</ProcSet [/PDF /Text] >>',
        MK: '<</BC [0.2 0.2 1] /BG [1 0.75 1]>>',
        stream: '1 0.75 1 rg\n0 0 326 21 re f\n0.7 0.7 1 RG 1 w\n0.5 0.5 325 20 re\ns',
    });

    const signatureName = 'Signature';
    // Generate signature annotation widget
    const widget = pdf.ref({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: [
            10 * fieldIds.length,
            10 * fieldIds.length,
            10 * fieldIds.length + 40,
            10 * fieldIds.length + 40,
        ],
        V: signature,
        T: new String(signatureName + (fieldIds.length + 1)), // eslint-disable-line no-new-wrappers
        F: 4,
        AP: `<< /N ${AP.index} 0 R >>`,
        P: pdf.page.dictionary, // eslint-disable-line no-underscore-dangle
    });
    // Include the widget in a page
    let form;

    const FONT = pdf.ref({
        Type: 'Font',
        SubType: 'Type1',
        Name: 'F1',
        BaseFont: 'Helvetica',
    });

    if (!isAcroFormExists) {
        // Create a form (with the widget) and link in the _root
        form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: 3,
            Fields: [widget],
            DR: `<< /Font << /Helv ${FONT.index} 0 R >> >>`,
            DA: new String('/Helv 0 Tf 0 g'), // eslint-disable-line no-new-wrappers
        });
    } else {
        // Use existing acroform and extend the fields with newly created widgets
        form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: 3,
            Fields: [...fieldIds, widget],
            DR: `<< /Font << /Helv ${FONT.index} 0 R >> >>`,
            DA: new String('/Helv 0 Tf 0 g'), // eslint-disable-line no-new-wrappers
        }, acroFormId);
    }

    return {
        signature,
        form,
        widget,
    };
    /* eslint-enable no-underscore-dangle,no-param-reassign */
};

export default pdfkitAddPlaceholder;
