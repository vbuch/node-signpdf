import {DEFAULT_BYTE_RANGE_PLACEHOLDER} from './signpdf';

const hexStr = (input) => {
    let output = '';
    for (let i = 0; i < input.length; i += 2) {
        output += String.fromCharCode(parseInt(input.substr(i, 2), 16));
    }
    return output;
};


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
        P: pdf._root.data.Pages.data.Kids[0], // eslint-disable-line no-underscore-dangle
    });
    // Include the widget in a page
    pdf._root.data.Pages.data.Kids[0].data.Annots = [widget];

    // Create a form (with the widget) and link in the _root
    const form = pdf.ref({
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
        throw new Error('Failed to locate ByteRange.');
    }

    const byteRangeEnd = pdf.indexOf(']', byteRangePos);
    if (byteRangeEnd === -1) {
        throw new Error('Failed to locate the end of the ByteRange.');
    }

    const byteRange = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
    const matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+)\]/).exec(byteRange);

    const signedData = Buffer.concat([
        pdf.slice(
            parseInt(matches[1]),
            parseInt(matches[1]) + parseInt(matches[2]),
        ),
        pdf.slice(
            parseInt(matches[3]),
            parseInt(matches[3]) + parseInt(matches[4]),
        ),
    ]);

    let signatureHex = pdf.slice(
        parseInt(matches[1]) + parseInt(matches[2]) + 1,
        parseInt(matches[3]) - 1,
    ).toString('binary');
    signatureHex = signatureHex.replace(/(?:00)*$/, '');

    const signature = hexStr(signatureHex);

    return {signature, signedData};
};
