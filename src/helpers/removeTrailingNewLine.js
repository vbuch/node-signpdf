import SignPdfError from '../SignPdfError';

/**
 * Removes a trailing new line if there is such.
 *
 * Also makes sure the file ends with an EOF line as per spec.
 * @param {Buffer} pdf
 * @returns {Buffer}
 */
const removeTrailingNewLine = (pdf) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }

    const lastChar = pdf.slice(pdf.length - 1).toString();
    let output = pdf;
    if (lastChar === '\n') {
        // remove the trailing new line
        output = pdf.slice(0, pdf.length - 1);
    }

    const lastLine = output.slice(output.length - 6).toString();
    if (lastLine !== '\n%%EOF') {
        output = Buffer.concat([
            output,
            Buffer.from('\n%%EOF'),
        ]);
    }

    return output;
};

export default removeTrailingNewLine;
