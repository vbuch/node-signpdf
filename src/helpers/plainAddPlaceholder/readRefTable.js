import SignPdfError from "../../SignPdfError";

const parseTrailerXref = (prev, curr) => {
    const isObjectId = curr.split(' ').length === 2;

    if (isObjectId) {
        const [id] = curr.split(' ');
        return {...prev, [id]: undefined};
    }

    const [offset] = curr.split(' ');
    const prevId = Object.keys(prev).find((id) => prev[id] === undefined);

    return {...prev, [prevId]: parseInt(offset)};
};

const parseRootXref = (prev, l, i) => {
    const element = l.split(' ')[0];
    const isPageObject = parseInt(element) === 0 && element.length > 3;
    
    if (isPageObject) {
        return {...prev, 0: 0};
    }
    
    let [offset] = l.split(' ');
    offset = parseInt(offset);

    return {...prev, [i - 1]: offset};
};

export const getLastTrailerPosition = (pdf) => {
    const trailerStart = pdf.lastIndexOf(Buffer.from('trailer', 'utf8'));
    const trailer = pdf.slice(trailerStart, pdf.length - 6);

    const xRefPosition = trailer
        .slice(trailer.lastIndexOf(Buffer.from('startxref', 'utf8')) + 10)
        .toString();

    return parseInt(xRefPosition);
};

export const getXref = (pdf, position) => {
    let refTable = pdf.slice(position); // slice starting from where xref starts
    const realPosition = refTable.indexOf(Buffer.from('xref', 'utf8'));
    if (realPosition === -1) {
        throw new SignPdfError(
            `Could not find xref anywhere after ${position}.`,
            SignPdfError.TYPE_PARSE,
        );
    }
    if (realPosition > 0) {
        const prefix = refTable.slice(0, realPosition);
        if (prefix.toString().replace(/\s*/g, '') !== '') {
            throw new SignPdfError(
                `Expected xref at ${position} but found other content.`,
                SignPdfError.TYPE_PARSE,
            );
        }
    }
    
    refTable = refTable.slice(realPosition + 4); // move ahead with the "xref"
    refTable = refTable.slice(refTable.indexOf('\n') + 1); // move after the next new line
    
    // extract the size
    let size = (/\s*(\d+)/).exec(refTable.toString().split('/Size')[1])[1];
    if (`${parseInt(size)}` !== `${size}`) {
        throw new SignPdfError(
            `Unexpected size "${size}" found.`,
            SignPdfError.TYPE_PARSE,
        );
    }
    size = parseInt(size)

    const [objects, infos] = refTable.toString().split('trailer');

    const isContainingPrev = infos.split('/Prev')[1] != null;

    let prev;
    let reducer;

    if (isContainingPrev) {
        const pagesRefRegex = /Prev (\d+)/g;
        const match = pagesRefRegex.exec(infos);
        const [, prevPosition] = match;
        prev = prevPosition;
        reducer = parseTrailerXref;
    } else {
        reducer = parseRootXref;
    }

    const lines = objects
        .split('\n')
        .filter((l) => l !== '');
    
    const xRefContent = lines.reduce(reducer, {});

    return {
        size,
        prev,
        xRefContent,
    };
};

export const getFullXrefTable = (pdf) => {
    const lastTrailerPosition = getLastTrailerPosition(pdf);
    const lastXrefTable = getXref(pdf, lastTrailerPosition);

    if (lastXrefTable.prev === undefined) {
        return lastXrefTable.xRefContent;
    }
    const pdfWithoutLastTrailer = pdf.slice(0, lastTrailerPosition);
    const partOfXrefTable = getFullXrefTable(pdfWithoutLastTrailer);

    const mergedXrefTable = {
        ...partOfXrefTable,
        ...lastXrefTable.xRefContent,
    };

    return mergedXrefTable;
};

/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */
const readRefTable = (pdf) => {
    const offsetsMap = new Map();
    const fullXrefTable = getFullXrefTable(pdf);

    const startingIndex = 0;

    let maxOffset = 0;
    const maxIndex = parseInt(Object.keys(fullXrefTable).length) - 1;

    Object.keys(fullXrefTable).forEach((id) => {
        const offset = parseInt(fullXrefTable[id]);
        maxOffset = Math.max(maxOffset, offset);
        offsetsMap.set(parseInt(id), offset);
    });

    return {
        maxOffset,
        startingIndex,
        maxIndex,
        offsets: offsetsMap,
    };
};

export default readRefTable;
