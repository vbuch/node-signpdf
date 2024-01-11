/* eslint-disable no-underscore-dangle */
import {
    pdfkitAddPlaceholder,
    PDFKitReferenceMock,
    PDFObject,
} from '@signpdf/placeholder-pdfkit010';
import {
    removeTrailingNewLine,
    DEFAULT_SIGNATURE_LENGTH,
    SUBFILTER_ADOBE_PKCS7_DETACHED,
} from '@signpdf/utils';

import getIndexFromRef from './getIndexFromRef';
import readPdf from './readPdf';
import getPageRef from './getPageRef';
import createBufferRootWithAcroform from './createBufferRootWithAcroform';
import createBufferPageWithAnnotation from './createBufferPageWithAnnotation';
import createBufferTrailer from './createBufferTrailer';

/**
 * @param {string} pdf
 * @returns {string | undefined}
 */
const getAcroFormRef = (slice) => {
    const bufferRootWithAcroformRefRegex = /\/AcroForm\s+(\d+\s\d+\sR)/g;
    const match = bufferRootWithAcroformRefRegex.exec(slice);

    if (match != null && match[1] != null && match[1] !== '') {
        return match[1];
    }
    return undefined;
};

/**
* @typedef {object} InputType
* @property {Buffer} pdfBuffer
* @property {string} reason
* @property {string} contactInfo
* @property {string} name
* @property {string} location
* @property {Date} [signingTime]
* @property {number} [signatureLength]
* @property {string} [subFilter] One of SUBFILTER_* from \@signpdf/utils
* @property {number[]} [widgetRect] [x1, y1, x2, y2] widget rectangle
* @property {string} [appName] Name of the application generating the signature
*/

/**
 * Adds a signature placeholder to a PDF Buffer.
 *
 * This contrasts with the default pdfkit-based implementation.
 * Parsing is done using simple string operations.
 * Adding is done with `Buffer.concat`.
 * This allows node-signpdf to be used on any PDF and
 * not only on a freshly created through PDFKit one.
 *
 * @param {InputType}
 * @returns {Buffer}
 */
export const plainAddPlaceholder = ({
    pdfBuffer,
    reason,
    contactInfo,
    name,
    location,
    signingTime = undefined,
    signatureLength = DEFAULT_SIGNATURE_LENGTH,
    subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
    widgetRect = [0, 0, 0, 0],
    appName = undefined,
}) => {
    let pdf = removeTrailingNewLine(pdfBuffer);
    const info = readPdf(pdf);
    const pageRef = getPageRef(pdf, info);
    const pageIndex = getIndexFromRef(info.xref, pageRef);
    const addedReferences = new Map();

    const pdfKitMock = {
        ref: (input, knownIndex) => {
            info.xref.maxIndex += 1;

            const index = knownIndex != null ? knownIndex : info.xref.maxIndex;

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

    const acroFormRef = getAcroFormRef(info.root);
    if (acroFormRef) {
        pdfKitMock._root.data.AcroForm = acroFormRef;
    }

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
        signingTime,
        signatureLength,
        subFilter,
        widgetRect,
        appName,
    });

    if (!getAcroFormRef(pdf.toString())) {
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
