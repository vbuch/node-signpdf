import {DEFAULT_BYTE_RANGE_PLACEHOLDER, DEFAULT_SIGNATURE_LENGTH} from './const';
// eslint-disable-next-line import/no-unresolved
import PDFKitReferenceMock from './PDFKitReferenceMock';
import fs from 'fs';
import zlib from 'zlib';
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
    const FONT = pdf.ref({
        Type: 'Font',
        BaseFont: 'Helvetica',
        Encoding: 'WinAnsiEncoding',
        Subtype: 'Type1',
    });

    const ZAF = pdf.ref({
        Type: 'Font',
        BaseFont: 'ZapfDingbats',
        Subtype: 'Type1',
    });

    const APFONT = pdf.ref({
        Type: 'Font',
        BaseFont: 'Helvetica',
        Encoding: 'WinAnsiEncoding',
        Subtype: 'Type1',
    });

    const imagetest = fs.readFileSync('./resources/sig.png');

    const img = pdf.ref({
        Width: 1000,
        Filter: 'FlateDecode',
        Type: 'XObject',
        BitsPerComponent: 8,
        Subtype: 'Image',
        // ColorSpace: 'DeviceRGB',
        Height: 245,
        Predictor: 15,
        stream: zlib.deflateRawSync(imagetest),
    });

    const AP = pdf.ref({
        CropBox: [0, 0, 197, 70],
        Type: 'XObject',
        // Filter: 'FlateDecode',
        FormType: 1,
        BBox: [0, 0, 197.0, 70.0],
        Resources: `<</XObject <<\n/Img1 ${img.index} 0 R\n>>\n/Font <<\n/f1 ${APFONT.index} 0 R\n>>\n>>`,
        MediaBox: [0, 0, 197, 70],
        Subtype: 'Form',
        stream: Buffer.from(`
            1.0 1.0 1.0 rg
            0.0 0.0 0.0 RG
            q
            q
            98 0 0 24 0 23 cm
            /Img1 Do
            Q
            0 0 0 rg
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 58.77881 Tm
            (Digitally signed by) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 49.97412 Tm
            (gerald.holmann@qoppa.com) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 41.16943 Tm
            (cn=gerald.holmann@qoppa.) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 32.36475 Tm
            (com, email= gerald.) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 23.56006 Tm
            (holmann@qoppa.com) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 14.75537 Tm
            (Date: 2016.09.01 11:51:37 ) Tj
            ET
            BT
            0 Tr
            /f1 7.0 Tf
            1 0 0 1 100 5.95068 Tm
            (EDT) Tj
            ET
            Q`),
    });
    const signatureName = 'Signature';

    // Generate signature annotation widget
    const widget = pdf.ref({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: [188.67, 679.07, 384.78, 748.04],
        V: signature,
        T: new String(signatureName + (fieldIds.length + 1)), // eslint-disable-line no-new-wrappers
        F: 4,
        AP: `<</N ${AP.index} 0 R>>`,
        P: pdf.page.dictionary, // eslint-disable-line no-underscore-dangle
        DA: new String('/Helvetica 0 Tf 0 g'), // eslint-disable-line no-new-wrappers
    });
    // Include the widget in a page
    let form;

    if (!isAcroFormExists) {
        // Create a form (with the widget) and link in the _root
        form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: 3,
            Fields: [...fieldIds, widget],
            DR: `<</Font\n<</Helvetica ${FONT.index} 0 R/ZapfDingbats ${ZAF.index} 0 R>>\n>>`,
        });
    } else {
        // Use existing acroform and extend the fields with newly created widgets
        form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: 3,
            Fields: [...fieldIds, widget],
            DR: `<</Font\n<</Helvetica ${FONT.index} 0 R/ZapfDingbats ${ZAF.index} 0 R>>\n>>`,
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
