/**
 * @param {Buffer} trailer
 * @param {string} key
 * @returns {string}
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
