import SignPdfError from '../../SignPdfError';

/**
 * @param {Object} info As extracted from readRef()
 */
const getPagesDictionaryRef = (info) => {
    const catalogPosition = info.root.toString().indexOf('/Type/Catalog');

    if (catalogPosition < 0) {
        throw new SignPdfError(
            'Failed to find the pages descriptor. This is probably a problem in node-signpdf.',
            SignPdfError.TYPE_PARSE,
        );
    }

    const pagesRefRegex = new RegExp('\\/Pages\\s+(\\d+\\s\\d+\\sR)', 'g');
    const match = pagesRefRegex.exec(info.root);

    return match[1];
}
