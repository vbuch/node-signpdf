import SignPdfError from '../SignPdfError';
import {DEFAULT_BYTE_RANGE_PLACEHOLDER} from './const';

/**
 * Finds ByteRange information within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {Object} {byteRangePlaceholder: String, byteRangeStrings: String[], byteRange: String[]}
 */
const findByteRange = (pdf) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }

    const byteRangeStrings = pdf.toString().match(/\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*]{1}/g);

    if (!byteRangeStrings) {
        throw new SignPdfError(
            'No ByteRangeStrings found within PDF buffer',
            SignPdfError.TYPE_PARSE,
        );
    }

    const byteRangePlaceholder = byteRangeStrings.find((s) => s.includes(`/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`));
    const byteRanges = byteRangeStrings.map((brs) => brs.match(/[^[\s]*(?:\d|\/\*{10})/g));

    return {
        byteRangePlaceholder,
        byteRangeStrings,
        byteRanges,
    };
};

export default findByteRange;
