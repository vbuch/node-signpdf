import PDFObject from '../pdfkit/pdfobject';
import PDFKitReferenceMock from '../pdfkitReferenceMock';
import removeTrailingNewLine from '../removeTrailingNewLine';
import {DEFAULT_SIGNATURE_LENGTH} from '../const';
import pdfkitAddPlaceholder from '../pdfkitAddPlaceholder';

import getIndexFromRef from './getIndexFromRef';
import readPdf from './readPdf';
import getPageRef from './getPageRef';
import createBufferRootWithAcroform from './createBufferRootWithAcroform';
import createBufferPageWithAnnotation from './createBufferPageWithAnnotation';
import createBufferTrailer from './createBufferTrailer';
import getAcroForm from './getAcroForm';

const isContainBufferRootWithAcroform = (pdf) => {
    const bufferRootWithAcroformRefRegex = new RegExp('\\/AcroForm\\s+(\\d+\\s\\d+\\sR)', 'g');
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
}) => {
    let pdf = removeTrailingNewLine(pdfBuffer);
    const info = readPdf(pdf);
    const pageRef = getPageRef(pdf, info);
    const pageIndex = getIndexFromRef(info.xref, pageRef);
    const acroForm = getAcroForm(pdfBuffer);
    const addedReferences = new Map();
    const references = [];
    const dictionary = new PDFKitReferenceMock(pageIndex, {
        Annots: [],
    });

    const pdfKitMock = {
        ref: (data) => {
            info.xref.maxIndex += 1;
            const index = info.xref.maxIndex;
            addedReferences.set(index, pdf.length + 1); // + 1 new line

            const ref = new PDFKitReferenceMock(info.xref.maxIndex, data);
            references.push(ref);

            return ref;
        },
        page: {
            annotations: {push(...args) { dictionary.data.Annots.push(...args); }},
            dictionary,
        },
        _root: {
            data: {
                AcroForm: acroForm,
            },
        },
        _acroform: acroForm ? {} : undefined,
        initForm() {
            this._acroform = {};
            const form = this.ref({
                Fields: [],
                DR: {
                    Font: {},
                },
            });
            this._root.data.AcroForm = form;
        },
    };

    pdfkitAddPlaceholder({
        pdf: pdfKitMock,
        pdfBuffer,
        reason,
        contactInfo,
        name,
        location,
        signatureLength,
    });

    pdf = references.reduce((buffer, ref) => Buffer.concat([
        buffer,
        Buffer.from('\n'),
        Buffer.from(`${ref.index} 0 obj\n`),
        Buffer.from(PDFObject.convert(ref.data)),
        Buffer.from('\nendobj\n'),
    ]), pdf);

    if (!isContainBufferRootWithAcroform(pdf)) {
        const rootIndex = getIndexFromRef(info.xref, info.rootRef);
        addedReferences.set(rootIndex, pdf.length + 1);
        pdf = Buffer.concat([
            pdf,
            Buffer.from('\n'),
            createBufferRootWithAcroform(pdf, info, pdfKitMock._root.data.AcroForm),
        ]);
    }
    addedReferences.set(pageIndex, pdf.length + 1);
    pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        // probably a nicer way to get the widget - last field in form?
        createBufferPageWithAnnotation(pdf, info, pageRef, pdfKitMock._root.data.AcroForm.data.Fields.pop()),
    ]);

    pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        createBufferTrailer(pdf, info, addedReferences),
    ]);

    return pdf;
};

export default plainAddPlaceholder;
