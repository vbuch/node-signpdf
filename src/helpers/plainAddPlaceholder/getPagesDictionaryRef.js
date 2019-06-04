import SignPdfError from '../../SignPdfError';

const getPagesDictionaryRef = (info) => {
    const pagesRefRegex = new RegExp('\\/Type\\s*\\/Catalog\\s*\\/Pages\\s+(\\d+\\s\\d+\\sR)', 'g');
    const match = pagesRefRegex.exec(info.root);
    if (match === null) {
        throw new SignPdfError(
            'Failed to find the pages descriptor. This is probably a problem in node-signpdf.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return match[1];
};

export default getPagesDictionaryRef;
