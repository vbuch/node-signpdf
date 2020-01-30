import findObject from './findObject';
import getIndexFromRef from './getIndexFromRef';

const createBufferPageWithAnnotation = (pdf, info, pagesRef, widget) => {
    const pagesDictionary = findObject(pdf, info.xref, pagesRef).toString();
    
    // Extend page dictionary with newly created annotations
    const annotsStart = pagesDictionary.indexOf('/Annots');
    const annotsEnd = pagesDictionary.indexOf(']', annotsStart);
    let annots = pagesDictionary.substr(annotsStart, annotsEnd - annotsStart + 1);
    annots = annots.substr(0, annots.length - 1); // remove the trailing ]

    const pagesDictionaryIndex = getIndexFromRef(info.xref, pagesRef);
    const widgetValue = widget.toString();

    annots = annots + ' ' + widgetValue + ']'; // add the trailing ] back

    const preAnnots = pagesDictionary.substr(0, annotsStart);
    const postAnnots = pagesDictionary.substr(annotsEnd + 1);

    return Buffer.concat([
        Buffer.from(`${pagesDictionaryIndex} 0 obj\n`),
        Buffer.from('<<\n'),
        Buffer.from(`${preAnnots + annots + postAnnots}\n`),
        Buffer.from('\n>>\nendobj\n'),
    ]);
};

export default createBufferPageWithAnnotation;
