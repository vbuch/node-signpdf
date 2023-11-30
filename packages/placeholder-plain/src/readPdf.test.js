import {readTestResource} from '@signpdf/internal-utils';
import readPdf from './readPdf';

describe(readPdf, () => {
    it('reads contributing.pdf', () => {
        const pdfBuffer = readTestResource('contributing.pdf');
        const result = readPdf(pdfBuffer);

        expect(result.xRefPosition).toBe(72203);
        expect(result.rootRef).toBe('12 0 R');
        expect(result.infoRef).toBe('1 0 R');
    });
    it('reads issue-79-test.pdf', () => {
        const pdfBuffer = readTestResource('issue-79-test.pdf');
        const result = readPdf(pdfBuffer);

        expect(result.xRefPosition).toBe(1542);
        expect(result.rootRef).toBe('2 0 R');
        expect(result.infoRef).toBe('3 0 R');
    });
});
