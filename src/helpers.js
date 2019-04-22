import {DEFAULT_BYTE_RANGE_PLACEHOLDER} from './signpdf';
import SignPdfError from './SignPdfError';

/**
 * Removes a trailing new line if there is such.
 *
 * Also makes sure the file ends with an EOF line as per spec.
 * @param {Buffer} pdf
 * @returns {Buffer}
 */
export const removeTrailingNewLine = (pdf) => {
    const lastChar = pdf.slice(pdf.length - 1).toString();
    if (lastChar === '\n') {
        // remove the trailing new line
        return pdf.slice(0, pdf.length - 1);
    }

    const lastLine = pdf.slice(pdf.length - 6).toString();
    if (lastLine !== '\n%%EOF') {
        throw new SignPdfError(
            'A PDF file must end with an EOF line.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return pdf;
};

/**
 * @param {Buffer} pdf
 * @returns {object}
 */
export const readRefTable = (pdf, position) => {
    const offsetsMap = new Map();
    let refTable = pdf.slice(position);
    if (refTable.indexOf('xref') !== 0) {
        throw new SignPdfError(
            'Unexpected cross-reference table format.',
            SignPdfError.TYPE_PARSE,
        );
    }
    refTable = refTable.slice(4);
    refTable = refTable.slice(refTable.indexOf('\n') + 1);
    let nextNewLine = refTable.indexOf('\n');
    let line = refTable.slice(0, nextNewLine);
    refTable = refTable.slice(nextNewLine + 1);
    let [startingIndex, length] = line.toString().split(' ');
    startingIndex = parseInt(startingIndex);
    length = parseInt(length);

    const tableRows = [];
    let maxOffset = 0;
    for (let i = startingIndex; i < startingIndex + length; i += 1) {
        nextNewLine = refTable.indexOf('\n');
        line = refTable.slice(0, nextNewLine).toString();
        refTable = refTable.slice(nextNewLine + 1);
        tableRows.push(line);

        let [offset, generation, inUseOrFree] = line.split(' ');
        offset = parseInt(offset);
        maxOffset = Math.max(maxOffset, offset);

        offsetsMap.set(i, offset);
    }

    return {
        tableOffset: position,
        tableRows,
        maxOffset,
        offsets: offsetsMap,
    };
};

/**
 * @param {Buffer} pdf
 * @param {Map} refTable
 * @returns {object}
 */
export const findObject = (pdf, refTable, ref) => {
    const [index] = ref.split(' ');
    if (!refTable.has(parseInt(index))) {
        throw new SignPdfError(
            `Failed to locate object "${ref}".`,
            SignPdfError.TYPE_PARSE,
        );
    }

    const offset = refTable.get(parseInt(index));
    let slice = pdf.slice(offset);
    slice = slice.slice(0, slice.indexOf('endobj'));

    // FIXME: What if it is a stream?
    slice = slice.slice(slice.indexOf('<<') + 2);
    slice = slice.slice(0, slice.indexOf('>>'));
    return slice;
};

/**
 * @param {Buffer} pdf
 */
export const readLastTrailer = (pdf) => {
    const trailerStart = pdf.lastIndexOf('trailer');
    const trailer = pdf.slice(trailerStart, pdf.length - 6);

    if (trailer.lastIndexOf('/Prev') !== -1) {
        throw new SignPdfError(
            'Incrementally updated PDFs are not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }

    let rootSlice = trailer.slice(trailer.indexOf('/Root'));
    rootSlice = rootSlice.slice(0, rootSlice.indexOf('/', 1));
    const rootRef = rootSlice.slice(6).toString().trim(); // /Root + at least one space

    let xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();
    xRefPosition = parseInt(xRefPosition);
    const refTable = readRefTable(pdf, xRefPosition);

    const root = findObject(pdf, refTable.offsets, rootRef).toString();
    if (root.indexOf('AcroForm') !== -1) {
        throw new SignPdfError(
            'The document already contains a form. This is not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }
    if (refTable.maxOffset > refTable.tableOffset) {
        throw new SignPdfError(
            'Ref table is not at the end of the document. This document can only be signed in incremental mode.',
            SignPdfError.TYPE_PARSE,
        );
    }

    console.log(refTable);
    console.log(root);
};

/**
 * @param {Buffer} pdf
 */
export const plainAdd = (pdfBuffer) => {
    const pdf = removeTrailingNewLine(pdfBuffer);
    console.log(readLastTrailer(pdf));
    return pdf;
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

    const signature = Buffer.from(signatureHex, 'hex').toString('binary');

    return {ByteRange: matches.slice(1, 5).map(Number), signature, signedData};
};
