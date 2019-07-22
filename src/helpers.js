import {DEFAULT_BYTE_RANGE_PLACEHOLDER} from './signpdf';
import SignPdfError from './SignPdfError';

/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {PDFDocument} pdf
 * @param {string} reason
 * @returns {object}
 */
export const addSignaturePlaceholder = ({pdf, reason, signatureLength = 8192}) => {
    /* eslint-disable no-underscore-dangle,no-param-reassign */
    // Generate the signature placeholder
    const signature = pdf.ref({
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: 'adbe.pkcs7.detached',
        ByteRange: [
            0,
            DEFAULT_BYTE_RANGE_PLACEHOLDER,
            DEFAULT_BYTE_RANGE_PLACEHOLDER,
            DEFAULT_BYTE_RANGE_PLACEHOLDER,
        ],
        Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
        Reason: new String(reason), // eslint-disable-line no-new-wrappers
        M: new Date(),
    });

    // Generate signature annotation widget
    const widget = pdf.ref({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: [0, 0, 0, 0],
        V: signature,
        T: new String('Signature1'), // eslint-disable-line no-new-wrappers
        F: 4,
        P: pdf.page.dictionary, // eslint-disable-line no-underscore-dangle
    });
    // Include the widget in a page
    pdf.page.dictionary.data.Annots = [widget];

    // Create a form (with the widget) and link in the _root
    const form = pdf.ref({
        Type: 'AcroForm',
        SigFlags: 3,
        Fields: [widget],
    });
    pdf._root.data.AcroForm = form;

    return {
        signature,
        form,
        widget,
    };
    /* eslint-enable no-underscore-dangle,no-param-reassign */
};


export const extractSignature = (pdf) => {
    const byteRangePos = pdf.indexOf('/ByteRange [');
    if (byteRangePos === -1) {
        throw new SignPdfError(
            'Failed to locate ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRangeEnd = pdf.indexOf(']', byteRangePos);
    if (byteRangeEnd === -1) {
        throw new SignPdfError(
            'Failed to locate the end of the ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRangeText = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
    const matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/).exec(byteRangeText);
    if (matches === null) {
        throw new SignPdfError(
            'Failed to parse the ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }
    const ByteRange = matches
        .slice(1)
        .map(Number);

    const signedData = Buffer.concat([
        pdf.slice(ByteRange[0], ByteRange[0] + ByteRange[1]),
        pdf.slice(ByteRange[2], ByteRange[2] + ByteRange[3]),
    ]);
    const signatureHex = pdf.slice(ByteRange[0] + ByteRange[1] + 1, ByteRange[2])
        .toString('binary').replace(/(?:00|>)+$/, '');
    const signature = Buffer.from(signatureHex, 'hex').toString('binary');
    return {
        ByteRange,
        signature,
        signedData,
    };
};
