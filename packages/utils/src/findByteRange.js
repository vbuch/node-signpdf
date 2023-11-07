import {SignPdfError} from './SignPdfError';
import {DEFAULT_BYTE_RANGE_PLACEHOLDER} from './const';

/**
* @typedef {object} OutputType
* @property {string | undefined} byteRangePlaceholder
* @property {number | undefined} byteRangePlaceholderPosition
* @property {string[]} byteRangeStrings
* @property {string[]} byteRange
*/

/**
 * Finds ByteRange information within a given PDF Buffer if one exists
 *
 * @param {Buffer} pdf
 * @returns {OutputType}
 */
export const findByteRange = (pdf, placeholder = DEFAULT_BYTE_RANGE_PLACEHOLDER) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }

    let byteRangePlaceholder;
    let byteRangePlaceholderPosition;
    const byteRangeStrings = [];
    const byteRanges = [];
    let offset = 0;
    do {
        const position = pdf.indexOf('/ByteRange', offset);
        if (position === -1) {
            break;
        }

        const rangeStart = pdf.indexOf('[', position);
        const rangeEnd = pdf.indexOf(']', rangeStart);

        const byteRangeString = pdf.subarray(position, rangeEnd + 1);
        byteRangeStrings.push(byteRangeString.toString());

        const range = pdf.subarray(rangeStart + 1, rangeEnd)
            .toString()
            .split(' ')
            .filter((c) => c !== '')
            .map((c) => c.trim());

        byteRanges.push(range);

        const placeholderName = `/${placeholder}`;
        if (range[0] === '0' && range[1] === placeholderName && range[2] === placeholderName && range[3] === placeholderName) {
            if (typeof byteRangePlaceholder !== 'undefined') {
                throw new SignPdfError(
                    'Found multiple ByteRange placeholders.',
                    SignPdfError.TYPE_INPUT,
                );
            }
            byteRangePlaceholder = byteRangeString.toString();
            byteRangePlaceholderPosition = position;
        }

        offset = rangeEnd;

        // eslint-disable-next-line no-constant-condition
    } while (true);

    return {
        byteRangePlaceholder,
        byteRangePlaceholderPosition,
        byteRangeStrings,
        byteRanges,
    };
};
