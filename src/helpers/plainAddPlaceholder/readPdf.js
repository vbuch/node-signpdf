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

    let xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();

    xRefPosition = parseInt(xRefPosition);
    const refTable = readRefTable(pdfBuffer);

    let rootSlice = trailer.slice(trailer.indexOf('/Root'));
    let rootIndex = rootSlice.indexOf('/', 1);
    if (rootIndex === -1) {
        rootIndex = rootSlice.indexOf('>', 1);
    }
    rootSlice = rootSlice.slice(0, rootIndex);
    const rootRef = rootSlice.slice(6).toString().trim(); // /Root + at least one space
    const root = findObject(pdfBuffer, refTable, rootRef).toString();

    return {
        xref: refTable,
        rootRef,
        root,
        trailerStart,
        previousXrefs: [],
        xRefPosition,
    };
};

export default readPdf;
