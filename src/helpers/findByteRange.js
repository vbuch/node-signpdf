import SignPdfError from '../SignPdfError';

/**
 * Finds the ByteRange within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {Object} {byteRangeString: String, byteRange: String[]}
 */
const findByteRange = (pdf) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }

    const byteRangeMatch = /\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*\]{1}/g.exec(pdf);

    if (!byteRangeMatch) {
        throw new SignPdfError(
            'No ByteRangeString found within PDF buffer',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRangeString = byteRangeMatch[0];
    const byteRange = byteRangeString.match(/[^\[\s]*(?:\d|\/\*{10})/g);

    return {
      byteRangeString,
      byteRange
    };
};

export default findByteRange;