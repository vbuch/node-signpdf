import {SignPdfError} from '@signpdf/utils';
import xrefToRefMap from './xrefToRefMap';

/**
 * @param {Buffer} pdf
 * @returns {number}
 */
export const getLastXrefPosition = (pdf) => {
    const xRefPosition = pdf
        .subarray(
            pdf.lastIndexOf(Buffer.from('startxref', 'utf8')) + 10,
            pdf.lastIndexOf(Buffer.from('%%EOF', 'utf8')),
        )
        .toString()
        .trim();

    const lastXrefPosition = parseInt(xRefPosition);
    if (`${lastXrefPosition}` !== xRefPosition) {
        throw new SignPdfError(
            `Expected an integer startxref position but got ${xRefPosition} instead.`,
            SignPdfError.TYPE_PARSE,
        );
    }
    return lastXrefPosition;
};

/**
 * @param {Buffer} pdfSlice
 * @param {number} position
 * @returns {GetXRefReturnType | null}
 */
const readXrefTableAt = (pdfSlice, position) => {
    let refTable = pdfSlice.subarray(position); // slice starting from where xref starts
    const realPosition = refTable.indexOf(Buffer.from('xref', 'utf8'));
    if (realPosition === -1) {
        return null;
    }
    if (realPosition > 0) {
        const prefix = refTable.subarray(0, realPosition);
        if (prefix.toString().replace(/\s*/g, '') !== '') {
            return null;
        }
    }

    // move ahead with the "xref\n"
    refTable = refTable.subarray(realPosition + 5);

    // extract the size
    let size = refTable.toString().split('/Size')[1];

    if (!size) {
        throw new SignPdfError(
            'Size not found in xref table.',
            SignPdfError.TYPE_PARSE,
        );
    }
    size = (/^\s*(\d+)/).exec(size);
    if (size === null) {
        throw new SignPdfError(
            'Failed to parse size of xref table.',
            SignPdfError.TYPE_PARSE,
        );
    }
    size = parseInt(size[1]);

    const [objects, infos] = refTable.toString().split('trailer');

    const isContainingPrev = infos.split('/Prev')[1] != null;

    let prev;
    if (isContainingPrev) {
        const pagesRefRegex = /Prev (\d+)/g;
        const match = pagesRefRegex.exec(infos);
        const [, prevPosition] = match;
        prev = prevPosition;
    }

    const xRefContent = xrefToRefMap(objects);

    return {
        size,
        prev,
        xRefContent,
    };
};

/**
 * @typedef {object} GetXRefReturnType
 * // TODO
 */

/**
 * @param {Buffer} pdf
 * @param {number} position
 * @returns {GetXRefReturnType}
 * @throws {SignPdfError}
 */
export const getXref = (pdf, position) => {
    const table = readXrefTableAt(pdf, position);
    if (!table) {
        throw new SignPdfError(
            `Could not find xref anywhere at or after startxref position ${position}.`,
            SignPdfError.TYPE_PARSE,
        );
    }
    return table;
};

/**
 * @typedef {Map<*, *>} GetFullXrefTableReturnType
 */

/**
 * @param {Buffer} pdf
 * @param {number} xRefPosition
 * @returns {GetFullXrefTableReturnType}
 */
export const getFullXrefTable = (pdf, xRefPosition) => {
    const lastXrefTable = getXref(pdf, xRefPosition);

    if (lastXrefTable.prev === undefined) {
        return lastXrefTable.xRefContent;
    }
    const partOfXrefTable = getFullXrefTable(pdf, lastXrefTable.prev);

    const mergedXrefTable = new Map([
        ...partOfXrefTable,
        ...lastXrefTable.xRefContent,
    ]);

    return mergedXrefTable;
};

/**
 * @typedef {object} ReadRefTableReturnType
 * @prop {number} startingIndex
 * @prop {number} maxIndex
 * @prop {GetFullXrefTableReturnType} offsets
 */

/**
 * @param {Buffer} pdfBuffer
 * @param {number} xRefPosition
 * @returns {ReadRefTableReturnType}
 */
const readRefTable = (pdf, xRefPosition) => {
    const fullXrefTable = getFullXrefTable(pdf, xRefPosition);
    const startingIndex = 0;
    const maxIndex = Math.max(...fullXrefTable.keys());

    return {
        startingIndex,
        maxIndex,
        offsets: fullXrefTable,
    };
};

export default readRefTable;
