import SignPdfError from '../../SignPdfError';
import readRefTable from './readRefTable';
import findObject from './findObject';

/**
 * @param {Buffer} pdf
 */
const readPdf = (pdf) => {
    const trailerStart = pdf.lastIndexOf('trailer');
    const trailer = pdf.slice(trailerStart, pdf.length - 6);

    if (trailer.lastIndexOf('/Prev') !== -1) {
        throw new SignPdfError(
            'Incrementally updated PDFs are not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }

    let rootSlice = trailer.slice(trailer.indexOf('/Root'));
    rootSlice = rootSlice.slice(0, rootSlice.indexOf('/', 1));
    const rootRef = rootSlice.slice(6).toString().trim(); // /Root + at least one space

    let xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();
    xRefPosition = parseInt(xRefPosition);
    const refTable = readRefTable(pdf, xRefPosition);

    const root = findObject(pdf, refTable, rootRef).toString();
    if (root.indexOf('AcroForm') !== -1) {
        throw new SignPdfError(
            'The document already contains a form. This is not yet supported.',
            SignPdfError.TYPE_PARSE,
        );
    }
    if (refTable.maxOffset > refTable.tableOffset) {
        throw new SignPdfError(
            'Ref table is not at the end of the document. This document can only be signed in incremental mode.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return {
        xref: refTable,
        rootRef,
        root,
        trailerStart,
    };
};

export default readPdf;
