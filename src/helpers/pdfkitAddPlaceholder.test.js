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

        const refs = pdfkitAddPlaceholder({pdf, pdfBuffer: Buffer.from([pdf])});
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

    it('placeholder contains reason, contactInfo, name, location', () => {
        const pdf = new PDFDocument({
            autoFirstPage: true,
            size: 'A4',
            layout: 'portrait',
            bufferPages: true,
        });
        pdf.info.CreationDate = '';

        const refs = pdfkitAddPlaceholder({
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
            contactInfo :'testemail@test.com',
            name :'test name',
            location : 'test Location'
        });
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        let widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(widgetData['Reason']).toEqual('test reason')
        expect(widgetData['ContactInfo']).toEqual('testemail@test.com')
        expect(widgetData['Name']).toEqual('test name')
        expect(widgetData['Location']).toEqual('test Location')
    });

    it('placeholder contains default values for contactInfo, name, location', () => {
        const pdf = new PDFDocument({
            autoFirstPage: true,
            size: 'A4',
            layout: 'portrait',
            bufferPages: true,
        });
        pdf.info.CreationDate = '';

        const refs = pdfkitAddPlaceholder({
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason'
        });
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        let widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(widgetData['Reason']).toEqual('test reason')
        expect(widgetData['ContactInfo']).toEqual('emailfromp1289@gmail.com')
        expect(widgetData['Name']).toEqual('Name from p12')
        expect(widgetData['Location']).toEqual('Location from p12')
    });
});
