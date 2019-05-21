import PDFDocument from 'pdfkit';
import pdfkitAddPlaceholder from './pdfkitAddPlaceholder';

describe('pdfkitAddPlaceholder', () => {
    it('adds placeholder to PDFKit document', () => {
        const pdf = new PDFDocument({
            autoFirstPage: true,
            size: 'A4',
            layout: 'portrait',
            bufferPages: true,
        });
        pdf.info.CreationDate = '';

        const refs = pdfkitAddPlaceholder({pdf});
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        expect(pdf.page.dictionary.data.Annots[0].data.V.data.ByteRange).toEqual([
            0,
            '**********',
            '**********',
            '**********',
        ]);
    });
});
