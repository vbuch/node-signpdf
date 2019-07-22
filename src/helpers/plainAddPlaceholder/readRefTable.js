import SignPdfError from '../../SignPdfError';

/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */
const readRefTable = (pdfBuffer, position) => {
    const offsetsMap = new Map();
    let refTable = pdfBuffer.slice(position);
    if (refTable.indexOf('xref') !== 0) {
        throw new SignPdfError(
            'Unexpected cross-reference table format.',
            SignPdfError.TYPE_PARSE,
        );
    }
    refTable = refTable.slice(4);
    refTable = refTable.slice(refTable.indexOf('\n') + 1);

    // FIXME: This only expects one subsection. Will go wrong if there are multiple.
    let nextNewLine = refTable.indexOf('\n');
    let line = refTable.slice(0, nextNewLine);
    refTable = refTable.slice(nextNewLine + 1);
    let [startingIndex, length] = line.toString().split(' ');
    startingIndex = parseInt(startingIndex);
    length = parseInt(length);

    const tableRows = [];
    let maxOffset = 0;
    let maxIndex = 0;
    for (let i = startingIndex; i < startingIndex + length; i += 1) {
        nextNewLine = refTable.indexOf('\n');
        line = refTable.slice(0, nextNewLine).toString();
        refTable = refTable.slice(nextNewLine + 1);
        tableRows.push(line);

        let [offset] = line.split(' ');
        offset = parseInt(offset);
        maxOffset = Math.max(maxOffset, offset);
        maxIndex = Math.max(maxIndex, i);

        offsetsMap.set(i, offset);
    }

    return {
        tableOffset: position,
        tableRows,
        maxOffset,
        startingIndex,
        maxIndex,
        offsets: offsetsMap,
    };
};

export default readRefTable;
