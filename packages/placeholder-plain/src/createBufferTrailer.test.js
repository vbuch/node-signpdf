import {readTestResource} from '@signpdf/internal-utils';
import createBufferTrailer from './createBufferTrailer';

describe(createBufferTrailer, () => {
    it('creates expected outputs', () => {
        const pdfBuffer = readTestResource('signed.pdf');

        /** @type {import("./readPdf").ReadPdfReturnType} */
        const info = {
            xref: {
                startingIndex: 0,
                maxIndex: 2,
                offsets: new Map([
                    [1, 4163],
                    [2, 4098],
                ]),
            },
            rootRef: '1 0 R',
            root: '\n/Type /Catalog\n/Pages 1 0 R\n/AcroForm 9 0 R\n',
            infoRef: '2 0 R',
            trailerStart: 4510,
            previousXrefs: [],
            xRefPosition: 4220,
        };
        const addedReferences = new Map();

        expect(createBufferTrailer(pdfBuffer, info, addedReferences).toString()).toMatchSnapshot();

        info.infoRef = undefined;
        expect(createBufferTrailer(pdfBuffer, info, addedReferences).toString()).toMatchSnapshot();

        addedReferences.set(3, 4077);
        addedReferences.set(4, 3812);
        expect(createBufferTrailer(pdfBuffer, info, addedReferences).toString()).toMatchSnapshot();
    });
});
