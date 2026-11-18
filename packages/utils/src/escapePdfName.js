const DELIMITERS = '()<>[]{}/%#';

/**
 * Escapes a value so it can be written as a PDF name object (without the leading slash).
 *
 * As per ISO 32000-1 7.3.5, the value is encoded as UTF-8 and every byte outside
 * the range ! to ~, every delimiter and the number sign itself is written as #xx.
 * Values that need no escaping are returned unchanged.
 * @param {string} name
 * @returns {string}
 */
export const escapePdfName = (name) => Array.from(
    Buffer.from(name, 'utf8'),
    (byte) => {
        const character = String.fromCharCode(byte);
        if (byte < 0x21 || byte > 0x7e || DELIMITERS.includes(character)) {
            return `#${byte.toString(16).padStart(2, '0')}`;
        }
        return character;
    },
).join('');
