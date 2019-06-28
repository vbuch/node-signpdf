import getPagesDictionaryRef from './getPagesDictionaryRef';
import findObject from './findObject';

/**
 * Finds the reference to a page.
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} info As extracted from readRef()
 */
export default function getPageRef(pdfBuffer, info) {
    const pagesRef = getPagesDictionaryRef(info);
    const pagesDictionary = findObject(pdfBuffer, info.xref, pagesRef);
    const kidsPosition = pagesDictionary.indexOf('/Kids');
    const kidsStart = pagesDictionary.indexOf('[', kidsPosition) + 1;
    const kidsEnd = pagesDictionary.indexOf(']', kidsPosition);
    const pages = pagesDictionary.slice(kidsStart, kidsEnd).toString();
    const split = pages.trim().split(' ', 3);
    return `${split[0]} ${split[1]} ${split[2]}`;
}
