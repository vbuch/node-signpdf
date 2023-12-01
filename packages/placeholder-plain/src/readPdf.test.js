import {readTestResource} from '@signpdf/internal-utils';
import readPdf from './readPdf';

describe(readPdf, () => {
    it.each([
        {
            resource: 'signed-once.pdf',
            xRefPosition: 19174,
            root: 14,
            rootByteOffset: 18928,
            info: 15,
        },
        {
            resource: 'contributing.pdf',
            xRefPosition: 72203,
            root: 12,
            rootByteOffset: 4394,
            info: 1,
        },
    ])('reads $resource', ({
        resource, root, info, xRefPosition, rootByteOffset,
    }) => {
        const pdfBuffer = readTestResource(resource);
        const result = readPdf(pdfBuffer);

        expect(result.xRefPosition).toBe(xRefPosition);
        expect(result.rootRef).toBe(`${root} 0 R`);
        expect(result.infoRef).toBe(`${info} 0 R`);
        expect(result.xref.offsets.get(root)).toBe(rootByteOffset);
    });
});
