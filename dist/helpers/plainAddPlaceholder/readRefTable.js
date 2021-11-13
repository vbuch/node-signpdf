"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const parseTrailerXref = (prev, curr) => {
  const isObjectId = curr.split(' ').length === 2;

  if (isObjectId) {
    const [id] = curr.split(' ');
    return { ...prev,
      [id]: undefined
    };
  }

  const [offset] = curr.split(' ');
  const prevId = Object.keys(prev).find(id => prev[id] === undefined);
  return { ...prev,
    [prevId]: parseInt(offset)
  };
};

const parseRootXref = (prev, l, i) => {
  const element = l.split(' ')[0];
  const isPageObject = parseInt(element) === 0 && element.length > 3;

  if (isPageObject) {
    return { ...prev,
      0: 0
    };
  }

  let [offset] = l.split(' ');
  offset = parseInt(offset);
  return { ...prev,
    [i - 1]: offset
  };
};

const getLastTrailerPosition = pdf => {
  const trailerStart = pdf.lastIndexOf('trailer');
  const trailer = pdf.slice(trailerStart, pdf.length - 6);
  const xRefPosition = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();
  return parseInt(xRefPosition);
};

const getXref = (pdf, position) => {
  let refTable = pdf.slice(position);
  refTable = refTable.slice(4);
  refTable = refTable.slice(refTable.indexOf('\n') + 1);
  const size = refTable.toString().split('/Size')[1];
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

  const xRefContent = objects.split('\n').filter(l => l !== '').reduce(reducer, {});
  return {
    size,
    prev,
    xRefContent
  };
};

const getFullXrefTable = pdf => {
  const lastTrailerPosition = getLastTrailerPosition(pdf);
  const lastXrefTable = getXref(pdf, lastTrailerPosition);

  if (lastXrefTable.prev === undefined) {
    return lastXrefTable.xRefContent;
  }

  const pdfWithoutLastTrailer = pdf.slice(0, lastTrailerPosition);
  const partOfXrefTable = getFullXrefTable(pdfWithoutLastTrailer);
  const mergedXrefTable = { ...partOfXrefTable,
    ...lastXrefTable.xRefContent
  };
  return mergedXrefTable;
};
/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */


const readRefTable = pdf => {
  const offsetsMap = new Map();
  const fullXrefTable = getFullXrefTable(pdf);
  const startingIndex = 0;
  let maxOffset = 0;
  const maxIndex = parseInt(Object.keys(fullXrefTable).length) - 1;
  Object.keys(fullXrefTable).forEach(id => {
    const offset = parseInt(fullXrefTable[id]);
    maxOffset = Math.max(maxOffset, offset);
    offsetsMap.set(parseInt(id), offset);
  });
  return {
    maxOffset,
    startingIndex,
    maxIndex,
    offsets: offsetsMap
  };
};

var _default = readRefTable;
exports.default = _default;