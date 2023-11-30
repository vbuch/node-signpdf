import {SignPdfError} from '@signpdf/utils';

/**
 * @param {string} xrefString
 * @returns {Map<number, number>}
 */
const xrefToRefMap = (xrefString) => {
    const lines = xrefString.split('\n').filter((l) => l !== '');

    let index = 0;
    let expectedLines = 0;

    /**
     * @type {Map<number, number>}
     */
    const xref = new Map();
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const split = line.split(' ');
        if (split.length === 2) {
            // We've found a line that states the next index and number of expected lines.
            // e.g.:
            // 39 35 # <--- this is the line
            // 0000655893 00000 n
            // 0000656101 00000 n
            index = parseInt(split[0]);
            expectedLines = parseInt(split[1]);
            continue;
        }
        if (expectedLines <= 0) {
            // We don't expect any more lines. Whatever is left is not part of the xref table.
            break;
        }
        expectedLines -= 1;
        const [offset, , inUse] = split;
        if (inUse.trim() === 'f') {
            // unused object
            index += 1;
            continue;
        }
        if (inUse.trim() !== 'n') {
            throw new SignPdfError(
                `Unknown in-use flag "${inUse}". Expected "n" or "f".`,
                SignPdfError.TYPE_PARSE,
            );
        }
        if (!/^\d+$/.test(offset.trim())) {
            throw new SignPdfError(
                `Expected integer offset. Got "${offset}".`,
                SignPdfError.TYPE_PARSE,
            );
        }

        const storeOffset = parseInt(offset.trim());
        xref.set(index, storeOffset);
        index += 1;
    }

    return xref;
};

export default xrefToRefMap;
