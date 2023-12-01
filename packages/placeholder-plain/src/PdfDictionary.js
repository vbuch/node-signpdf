import {SignPdfError} from '@signpdf/utils';

const CHARS = {
    NUL: 0,
    HT: 9,
    LF: 10,
    FF: 12,
    CR: 13,
    SP: 32,
    NUMSIGN: 35,
    PERCENT: 37,
    LPAREN: 40,
    RPAREN: 41,
    FSLASH: 47,
    LT: 60,
    GT: 62,
    LSQUARE: 91,
    RSQUARE: 93,
    LBRACE: 123,
    RBRACE: 125,
};

const spaces = [
    CHARS.NUL,
    CHARS.HT,
    CHARS.LF,
    CHARS.FF,
    CHARS.CR,
    CHARS.SP,
];

const newLines = [
    CHARS.LF,
    CHARS.CR,
];

const terminators = [
    CHARS.LPAREN,
    CHARS.RPAREN,
    CHARS.LT,
    CHARS.GT,
    CHARS.LSQUARE,
    CHARS.RSQUARE,
    CHARS.LBRACE,
    CHARS.RBRACE,
    CHARS.FSLASH,
    CHARS.PERCENT,
];

const delimiter = [
    ...spaces,
    ...terminators,
];

const pairs = [
    {open: CHARS.LPAREN, close: CHARS.RPAREN},
    {open: CHARS.LT, close: CHARS.GT},
    {open: CHARS.LSQUARE, close: CHARS.RSQUARE},
    {open: CHARS.LBRACE, close: CHARS.RBRACE},
];
const pairOpeners = pairs.map((pair) => pair.open);
const pairClosers = pairs.map((pair) => pair.close);

export default class PdfDictionary {
    /**
     * @param {Buffer} buffer
     */
    constructor(buffer) {
        this.buffer = buffer;

        try {
            this.map = this.parseBuffer();
        } catch (e) {
            throw new SignPdfError(
                `Failed to parse PDF dictionary: ${e.message}`,
                SignPdfError.TYPE_PARSE,
            );
        }
    }

    toString() {
        return this.buffer.toString();
    }

    get(key) {
        return this.map.get(key);
    }

    has(key) {
        return this.map.has(key);
    }

    #skipSpacesAt(start) {
        let index = start;
        while (index < this.buffer.length) {
            const char = this.buffer[index];
            if (spaces.includes(char)) {
                index += 1;
                continue;
            }
            return index;
        }
        return index;
    }

    #skipCommentsAt(start) {
        let index = start;
        if (this.buffer[index] !== CHARS.NUMSIGN) {
            return index;
        }

        while (index < this.buffer.length) {
            const char = this.buffer[index];
            index += 1;
            if (newLines.includes(char)) {
                return index;
            }
        }

        return index;
    }

    #skipSpacesAndCommentsAt(start) {
        let index = this.#skipSpacesAt(start);
        index = this.#skipCommentsAt(index);
        index = this.#skipSpacesAt(index);
        return index;
    }

    /**
     * @param {number} start
     */
    #parseNameAt(start) {
        let current = '';
        let index = start;
        while (index < this.buffer.length) {
            const char = this.buffer[index];
            if (current === '') {
                if (char === CHARS.FSLASH) {
                    current += Buffer.from([char]).toString();
                    index += 1;
                    continue;
                }

                break;
            }

            if (delimiter.includes(char)) {
                return {
                    value: current,
                    lastIndex: index - 1,
                };
            }

            current += Buffer.from([char]).toString();
            index += 1;
        }

        if (index === this.buffer.length) {
            // reached the end
            return {
                value: current,
                lastIndex: index,
            };
        }

        return {
            value: undefined,
            lastIndex: index,
        };
    }

    #parseValueAt(start) {
        let current = '';
        let index = start;

        const parsedName = this.#parseNameAt(index);
        if (parsedName.value !== undefined) {
            return parsedName;
        }

        const stack = [];

        while (index < this.buffer.length) {
            const char = this.buffer[index];
            if (pairOpeners.includes(char)) {
                stack.push(char);
            } else if (stack.length > 0) {
                if (pairClosers.includes(char)) {
                    const closerIndex = pairClosers.indexOf(char);
                    const lastOpener = stack.pop();
                    const openerIndex = pairOpeners.indexOf(lastOpener);
                    if (openerIndex !== closerIndex) {
                        throw new SignPdfError(
                            `Unbalanced parentheses in PDF dictionary. Expected "${pairClosers[openerIndex]}" but got "${char}".`,
                            SignPdfError.TYPE_PARSE,
                        );
                    }
                    if (stack.length === 0) {
                        current += Buffer.from([char]).toString();
                        return {
                            lastIndex: index,
                            value: current,
                        };
                    }
                }
            } else if (char === CHARS.FSLASH) {
                return {
                    lastIndex: index - 1,
                    value: current.trim(),
                };
            }

            current += Buffer.from([char]).toString();
            index += 1;
        }

        if (stack.length > 0) {
            const readable = stack.map((char) => Buffer.from([char]).toString()).join('", "');
            throw new SignPdfError(
                `Unbalanced parentheses in PDF dictionary. Opened but did not close "${readable}".`,
                SignPdfError.TYPE_PARSE,
            );
        }

        return {
            lastIndex: index,
            value: current.trim(),
        };
    }

    parseBuffer() {
        const result = new Map();

        let index = 0;
        let key = '';
        let value = '';

        while (index < this.buffer.length) {
            index = this.#skipSpacesAndCommentsAt(index);
            const parsedKey = this.#parseNameAt(index);
            if (parsedKey.value === undefined) {
                throw new SignPdfError(
                    'Failed to parse key in dictionary.',
                    SignPdfError.TYPE_PARSE,
                );
            }
            index = parsedKey.lastIndex + 1;
            key = parsedKey.value;

            index = this.#skipSpacesAndCommentsAt(index);
            const parsedValue = this.#parseValueAt(index);
            index = parsedValue.lastIndex + 1;
            value = parsedValue.value;

            result.set(key, value);
        }

        return result;
    }
}
