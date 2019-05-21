import SignPdfError from '../SignPdfError';

const extractSignature = (pdf) => {
    const byteRangePos = pdf.indexOf('/ByteRange [');
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
    // FIXME: https://github.com/vbuch/node-signpdf/issues/23
    const matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+)\]/).exec(byteRange);

    const signedData = Buffer.concat([
        pdf.slice(
            parseInt(matches[1]),
            parseInt(matches[1]) + parseInt(matches[2]),
        ),
        pdf.slice(
            parseInt(matches[3]),
            parseInt(matches[3]) + parseInt(matches[4]),
        ),
    ]);

    let signatureHex = pdf.slice(
        parseInt(matches[1]) + parseInt(matches[2]) + 1,
        parseInt(matches[3]) - 1,
    ).toString('binary');
    signatureHex = signatureHex.replace(/(?:00)*$/, '');

    const signature = Buffer.from(signatureHex, 'hex').toString('binary');

    return {ByteRange: matches.slice(1, 5).map(Number), signature, signedData};
};

export default extractSignature;
