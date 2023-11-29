import readRefTable from './readRefTable';
import findObject from './findObject';
import {getValue} from './getValue';

/**
 * @typedef {object} ReadPdfReturnType
 * @prop {import("./readRefTable").ReadRefTableReturnType} xref
 * @prop {string} rootRef
 * @prop {Buffer} root
 * @prop {string} infoRef
 * @prop {number} trailerStart
 * @prop {number} xRefPosition
 */

/**
 * Simplified parsing of a PDF Buffer.
 * Extracts reference table, root info and trailer start.
 *
 * See section 7.5.5 (File Trailer) of the PDF specs.
 *
 * @param {Buffer} pdfBuffer
 * @returns {ReadPdfReturnType}
 */
const readPdf = (pdfBuffer) => {
    // Extract the trailer dictionary.
    const trailerStart = pdfBuffer.lastIndexOf('trailer');
    // The trailer is followed by xref. Then an EOF. EOF's length is 6 characters.
    const trailer = pdfBuffer.slice(trailerStart, pdfBuffer.length - 6);

    let xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();

    xRefPosition = parseInt(xRefPosition);
    const refTable = readRefTable(pdfBuffer);

    const rootRef = getValue(trailer, '/Root');
    const root = findObject(pdfBuffer, refTable, rootRef).toString();

    const infoRef = getValue(trailer, '/Info');

    return {
        xref: refTable,
        rootRef,
        root,
        infoRef,
        trailerStart,
        xRefPosition,
    };
};

export default readPdf;
