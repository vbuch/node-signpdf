import SignPdfError from '../../SignPdfError';
import readRefTable from './readRefTable';
import findObject from './findObject';

/**
 * Simplified parsing of a PDF Buffer.
 * Extracts reference table, root info and trailer start.
 *
 * See section 7.5.5 (File Trailer) of the PDF specs.
 *
 * @param {Buffer} pdfBuffer
 */
const readPdf = (pdfBuffer) => {
    // Extract the trailer dictionary.
    const trailerStart = pdfBuffer.lastIndexOf('trailer');
    // The trailer is followed by xref. Then an EOF. EOF's length is 6 characters.
    const trailer = pdfBuffer.slice(trailerStart, pdfBuffer.length - 6);

    if (trailer.lastIndexOf('/Prev') !== -1) {
        throw new SignPdfError(
            'Incrementally updated PDFs are not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }

    let rootSlice = trailer.slice(trailer.indexOf('/Root'));
    rootSlice = rootSlice.slice(0, rootSlice.indexOf('/', 1));
    const rootRef = rootSlice.slice(6).toString().trim(); // /Root + at least one space

    // We've invcluded startxref in the trailer extracted above.
    // They are two separate things but as per 7.5.5 they are always one after the other.
    let xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();
    xRefPosition = parseInt(xRefPosition);
    const refTable = readRefTable(pdfBuffer, xRefPosition);

    // Now find the actual root.
    const root = findObject(pdfBuffer, refTable, rootRef).toString();
    if (root.indexOf('AcroForm') !== -1) {
        throw new SignPdfError(
            'The document already contains a form. This is not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return {
        xref: refTable,
        rootRef,
        root,
        trailerStart,
    };
};

export default readPdf;
