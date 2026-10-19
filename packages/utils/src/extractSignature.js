import {SignPdfError} from './SignPdfError';

const getSubstringIndex = (str, substring, n) => {
    let times = 0; let
        index = null;

    while (times < n && index !== -1) {
        index = str.indexOf(substring, index + 1);
        times += 1;
    }

    return index;
};

/**
 * Total encoded length (header + content) of the DER element starting at buf[0].
 * Returns -1 if the buffer does not start with a parseable SEQUENCE header.
 * @param {Buffer} buf
 * @returns {number}
 */
const derTotalLength = (buf) => {
    if (buf.length < 2 || buf[0] !== 0x30) {
        return -1;
    }
    const lengthByte = buf[1];
    if ((lengthByte & 0x80) === 0) {
        // Short form: the byte is the content length itself.
        return 2 + lengthByte;
    }
    const numLengthOctets = lengthByte & 0x7f;
    if (numLengthOctets === 0 || buf.length < 2 + numLengthOctets) {
        return -1;
    }
    let contentLength = 0;
    for (let i = 0; i < numLengthOctets; i += 1) {
        contentLength = contentLength * 256 + buf[2 + i];
    }
    return 2 + numLengthOctets + contentLength;
};

/**
 * Basic implementation of signature extraction.
 *
 * Really basic. Would work in the simplest of cases where there is only one signature
 * in a document and ByteRange is only used once in it.
 *
 * @param {Buffer} pdf
 * @returns {Object} {ByteRange: Number[], signature: Buffer, signedData: Buffer}
 */
export const extractSignature = (pdf, signatureCount = 1) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }

    // const byteRangePos = pdf.indexOf('/ByteRange [');
    const byteRangePos = getSubstringIndex(pdf, '/ByteRange [', signatureCount);
    if (byteRangePos === -1) {
        throw new SignPdfError(
            'Failed to locate ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRangeEnd = pdf.indexOf(']', byteRangePos);
    if (byteRangeEnd === -1) {
        throw new SignPdfError(
            'Failed to locate the end of the ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRange = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
    const matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/).exec(byteRange);
    if (matches === null) {
        throw new SignPdfError(
            'Failed to parse the ByteRange.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const ByteRange = matches.slice(1).map(Number);
    const signedData = Buffer.concat([
        pdf.slice(ByteRange[0], ByteRange[0] + ByteRange[1]),
        pdf.slice(ByteRange[2], ByteRange[2] + ByteRange[3]),
    ]);

    const signatureHex = pdf.slice(ByteRange[0] + ByteRange[1] + 1, ByteRange[2])
        .toString('binary')
        .replace(/(?:>|\s)+$/, '');

    // sign() right-pads the signature with zero bytes up to the placeholder
    // length. DER is self-describing, so read the real element length from the
    // SEQUENCE header instead of stripping trailing "00" pairs — a genuine
    // signature has a ~1/256 chance of ending in 0x00 itself, and the old
    // regex-based strip would eat those real bytes and corrupt the DER (#317).
    const padded = Buffer.from(signatureHex, 'hex');
    const totalLength = derTotalLength(padded);
    const signatureBuffer = totalLength > 0 && totalLength <= padded.length
        ? padded.slice(0, totalLength)
        // Not parseable as DER — keep the historical trailing-zero strip.
        : Buffer.from(signatureHex.replace(/(?:00)+$/, ''), 'hex');

    const signature = signatureBuffer.toString('binary');

    return {
        ByteRange: matches.slice(1, 5).map(Number),
        signature,
        signedData,
    };
};
