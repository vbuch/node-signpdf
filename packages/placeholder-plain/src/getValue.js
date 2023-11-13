/**
 * @param {Buffer} trailer
 * @param {string} key
 * @returns {string}
 *
 * FIXME:
 * 0 00 000 Null (NUL)
 * 9 09 011 Tab (HT)
 * 10 0A 012 Line feed (LF)
 * 12 0C 014 Form feed (FF)
 * 13 0D 015 Carriage return (CR)
 * 32 20 040 Space (SP)
 *
 * The delimiter characters (, ), <, >, [, ], {, }, /, and %
 *
 * ^ All are terminators
 */
export const getValue = (trailer, key) => {
    let index = trailer.indexOf(key);

    if (index === -1) {
        return undefined;
    }

    const slice = trailer.subarray(index);
    index = slice.indexOf('/', 1);
    if (index === -1) {
        index = slice.indexOf('>', 1);
    }
    return slice.subarray(key.length + 1, index).toString().trim(); // key + at least one space
};
