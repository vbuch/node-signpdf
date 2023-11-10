import getIndexFromRef from './getIndexFromRef';

/**
 * @typedef {object} FindObjectAtReturnType
 * @property {Buffer} dictionary
 * @property {Buffer} stream
 */

/**
 * @param {Buffer} pdf
 * @param {number} position
 * @returns {FindObjectAtReturnType}
 */
export const findObjectAt = (pdf, position) => {
    let slice = pdf.subarray(position);
    slice = slice.subarray(0, slice.indexOf('endobj', 'utf8') - 1);
    // ^ Buffer from the start position until the first endobj (included).

    const dictionary = slice.subarray(
        slice.indexOf('<<', 'utf8') + 2,
        slice.indexOf('>>', 'utf8') - 1,
    );
    const stream = slice.subarray(
        slice.indexOf('stream', 'utf8') + 6,
        slice.indexOf('endstream', 'utf8') - 1,
    );

    return {
        dictionary,
        stream,
    };
};

/**
 * @param {Buffer} pdf
 * @param {Map} refTable
 * @returns {Buffer}
 */
const findObject = (pdf, refTable, ref) => {
    const index = getIndexFromRef(refTable, ref);

    const offset = refTable.offsets.get(index);
    return findObjectAt(pdf, offset).stream;
};

export default findObject;
