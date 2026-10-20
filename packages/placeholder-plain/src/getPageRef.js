import {SignPdfError} from '@signpdf/utils';
import getPagesDictionaryRef from './getPagesDictionaryRef';
import findObject from './findObject';

/**
 * Finds the reference to a page.
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} info As extracted from readRef()
 * @param {Number} [pageNumber = 0] Desired page number
 */
export default function getPageRef(pdfBuffer, info, pageNumber = 0) {
    const pagesRef = getPagesDictionaryRef(info);
    const pagesDictionary = findObject(pdfBuffer, info.xref, pagesRef);
    const kidsPosition = pagesDictionary.indexOf('/Kids');
    const kidsStart = pagesDictionary.indexOf('[', kidsPosition) + 1;
    const kidsEnd = pagesDictionary.indexOf(']', kidsPosition);
    const pages = pagesDictionary.slice(kidsStart, kidsEnd).toString();
    const pagesSplit = [];
    pages.trim().split(' ').forEach((v, i) => (i % 3 === 0 ? pagesSplit.push([v]) : pagesSplit[pagesSplit.length - 1].push(v)));
    if (pageNumber < 0 || pagesSplit.length <= pageNumber) {
        throw new SignPdfError(`Failed to get reference of page "${pageNumber}".`, SignPdfError.TYPE_INPUT);
    }
    return pagesSplit[pageNumber].join(' ');
}
