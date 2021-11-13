import PDFObject from '../pdfkit/pdfobject';
import PDFKitReferenceMock from '../pdfkitReferenceMock';
import removeTrailingNewLine from '../removeTrailingNewLine';
import {DEFAULT_SIGNATURE_LENGTH, SUBFILTER_ADOBE_PKCS7_DETACHED} from '../const';
import pdfkitAddPlaceholder from '../pdfkitAddPlaceholder';

import getIndexFromRef from './getIndexFromRef';
import readPdf from './readPdf';
import getPageRef from './getPageRef';
import createBufferRootWithAcroform from './createBufferRootWithAcroform';
import createBufferPageWithAnnotation from './createBufferPageWithAnnotation';
import createBufferTrailer from './createBufferTrailer';

const isContainBufferRootWithAcroform = (pdf) => {
    const bufferRootWithAcroformRefRegex = /\/AcroForm\s+(\d+\s\d+\sR)/g;
    const match = bufferRootWithAcroformRefRegex.exec(pdf.toString());

    return match != null && match[1] != null && match[1] !== '';
};

/**
 * Adds a signature placeholder to a PDF Buffer.
 *
 * This contrasts with the default pdfkit-based implementation.
 * Parsing is done using simple string operations.
 * Adding is done with `Buffer.concat`.
 * This allows node-signpdf to be used on any PDF and
 * not only on a freshly created through PDFKit one.
 */
const plainAddPlaceholder = ({
    pdfBuffer,
    reason,
    contactInfo = 'emailfromp1289@gmail.com',
    name = 'Name from p12',
    location = 'Location from p12',
    signatureLength = DEFAULT_SIGNATURE_LENGTH,
    subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
}) => {
    let pdf = removeTrailingNewLine(pdfBuffer);
    const info = readPdf(pdf);
    const pageRef = getPageRef(pdf, info);
    const pageIndex = getIndexFromRef(info.xref, pageRef);
    const addedReferences = new Map();

    const pdfKitMock = {
        ref: (input, additionalIndex) => {
            info.xref.maxIndex += 1;

            const index = additionalIndex != null ? additionalIndex : info.xref.maxIndex;

            addedReferences.set(index, pdf.length + 1); // + 1 new line

            pdf = Buffer.concat([
                pdf,
                Buffer.from('\n'),
                Buffer.from(`${index} 0 obj\n`),
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
        pdfBuffer,
        reason,
        contactInfo,
        name,
        location,
        signatureLength,
        subFilter,
    });

    if (!isContainBufferRootWithAcroform(pdf)) {
        const rootIndex = getIndexFromRef(info.xref, info.rootRef);
        addedReferences.set(rootIndex, pdf.length + 1);
        pdf = Buffer.concat([
            pdf,
            Buffer.from('\n'),
            createBufferRootWithAcroform(pdf, info, form),
        ]);
    }
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
