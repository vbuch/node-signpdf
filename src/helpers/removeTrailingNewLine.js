import SignPdfError from '../SignPdfError';

/**
 * Removes a trailing new line if there is such.
 *
 * Also makes sure the file ends with an EOF line as per spec.
 * @param {Buffer} pdf
 * @returns {Buffer}
 */
const removeTrailingNewLine = (pdf) => {
    const lastChar = pdf.slice(pdf.length - 1).toString();
    if (lastChar === '\n') {
        // remove the trailing new line
        return pdf.slice(0, pdf.length - 1);
    }

    const lastLine = pdf.slice(pdf.length - 6).toString();
    if (lastLine !== '\n%%EOF') {
        throw new SignPdfError(
            'A PDF file must end with an EOF line.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return pdf;
};

export default removeTrailingNewLine;
