import {SignPdfError} from '@signpdf/utils';
import readRefTable, {getLastXrefPosition} from './readRefTable';
import findObject, {findObjectAt} from './findObject';

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
    const xRefPosition = getLastXrefPosition(pdfBuffer);

    let refTable;

    const trailerObject = findObjectAt(pdfBuffer, xRefPosition);
    if (trailerObject.stream.indexOf('trailer') !== -1) {
        // assuming trailer
        refTable = readRefTable(pdfBuffer, xRefPosition);
    } else {
        // assuming stream
        if (!trailerObject.dictionary.has('/Filter')) {
            throw new Error('Expected /Filter in trailer with streams.');
        }
        throw new SignPdfError(
            '/Filter is not implemented.',
            SignPdfError.TYPE_PARSE,
        );
    }
    const rootRef = trailerObject.dictionary.get('/Root');
    const root = findObject(pdfBuffer, refTable, rootRef).toString();
    const infoRef = trailerObject.dictionary.get('/Info');

    return {
        xref: refTable,
        rootRef,
        root,
        infoRef,
        xRefPosition,
    };
};

export default readPdf;
