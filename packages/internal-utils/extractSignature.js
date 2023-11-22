function getSubstringIndex(str, substring, n) {
    var times = 0;
    var index = null;

    while (times < n && index !== -1) {
        index = str.indexOf(substring, index + 1);
        times += 1;
    }

    return index;
};

/**
 * @typedef {Object} ExtractSignatureResult
 * @property {number[]} ByteRange
 * @property {Buffer} signature
 * @property {Buffer} signedData
 */

/**
 * Basic implementation of signature extraction.
 *
 * Really basic. Would work in the simplest of cases where there is only one signature
 * in a document and ByteRange is only used once in it.
 *
 * @param {Buffer} pdf
 * @param {number} signatureCount
 * @returns {ExtractSignatureResult}
 */
function extractSignature (pdf, signatureCount) {
    if (!(pdf instanceof Buffer)) {
        throw new Error('PDF expected as Buffer.');
    }

    // const byteRangePos = pdf.indexOf('/ByteRange [');
    var byteRangePos = getSubstringIndex(pdf, '/ByteRange [', signatureCount || 1);
    if (byteRangePos === -1) {
        throw new Error('Failed to locate ByteRange.');
    }

    var byteRangeEnd = pdf.indexOf(']', byteRangePos);
    if (byteRangeEnd === -1) {
        throw new Error('Failed to locate the end of the ByteRange.');
    }

    var byteRange = pdf.subarray(byteRangePos, byteRangeEnd + 1).toString();
    var matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/).exec(byteRange);
    if (matches === null) {
        throw new Error('Failed to parse the ByteRange.');
    }

    var ByteRange = matches.slice(1).map(Number);
    var signedData = Buffer.concat([
        pdf.subarray(ByteRange[0], ByteRange[0] + ByteRange[1]),
        pdf.subarray(ByteRange[2], ByteRange[2] + ByteRange[3]),
    ]);

    var signatureHex = pdf.subarray(ByteRange[0] + ByteRange[1] + 1, ByteRange[2])
        .toString('binary')
        .replace(/(?:00|>)+$/, '');

    var signature = Buffer.from(signatureHex, 'hex').toString('binary');

    return {
        ByteRange: matches.slice(1, 5).map(Number),
        signature: signature,
        signedData: signedData,
    };
};

module.exports = extractSignature;