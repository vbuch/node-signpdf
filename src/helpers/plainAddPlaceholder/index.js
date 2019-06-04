import PDFObject from '../pdfkit/pdfobject';
import PDFKitReferenceMock from '../PDFKitReferenceMock';
import removeTrailingNewLine from '../removeTrailingNewLine';
import {DEFAULT_SIGNATURE_LENGTH} from '../const';
import pdfkitAddPlaceholder from '../pdfkitAddPlaceholder';

import getIndexFromRef from './getIndexFromRef';
import readPdf from './readPdf';
import getPageRef from './getPageRef';
import createBufferRootWithAcroform from './createBufferRootWithAcroform';
import createBufferPageWithAnnotation from './createBufferPageWithAnnotation';
import createBufferTrailer from './createBufferTrailer';

/**
 * @param {Buffer} pdf
 */
const plainAddPlaceholder = (pdfBuffer, {reason, signatureLength = DEFAULT_SIGNATURE_LENGTH}) => {
    let pdf = removeTrailingNewLine(pdfBuffer);
    const info = readPdf(pdf);
    const pageRef = getPageRef(pdf, info);
    const pageIndex = getIndexFromRef(info.xref, pageRef);
    const addedReferences = new Map();

    const pdfKitMock = {
        ref: (input) => {
            info.xref.maxIndex += 1;

            addedReferences.set(info.xref.maxIndex, pdf.length + 1); // + 1 new line

            pdf = Buffer.concat([
                pdf,
                Buffer.from('\n'),
                Buffer.from(`${info.xref.maxIndex} 0 obj\n`),
                Buffer.from(PDFObject.convert(input)),
                Buffer.from('\nendobj\n'),
            ]);
            return new PDFKitReferenceMock(info.xref.maxIndex);
        },
        page: {
            dictionary: new PDFKitReferenceMock(
                pageIndex,
                {
                    data: {
                        Annots: [],
                    },
                },
            ),
        },
        _root: {
            data: {},
        },
    };

    const {
        form,
        widget,
    } = pdfkitAddPlaceholder({
        pdf: pdfKitMock,
        reason,
        signatureLength,
    });

    const rootIndex = getIndexFromRef(info.xref, info.rootRef);
    addedReferences.set(rootIndex, pdf.length + 1);
    pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        createBufferRootWithAcroform(pdf, info, form),
    ]);

    addedReferences.set(pageIndex, pdf.length + 1);
    pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        createBufferPageWithAnnotation(pdf, info, pageRef, widget),
    ]);

    pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        createBufferTrailer(pdf, info, addedReferences),
    ]);

    return pdf;
};

export default plainAddPlaceholder;
