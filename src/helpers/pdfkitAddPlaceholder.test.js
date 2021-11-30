import PDFDocument from 'pdfkit';
import pdfkitAddPlaceholder from './pdfkitAddPlaceholder';
import {SUBFILTER_ETSI_CADES_DETACHED} from './const';
import PDFObject from './pdfkit/pdfobject';

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
            contactInfo: 'testemail@test.com',
            name: 'test name',
            location: 'test Location',
        });
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        const widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(PDFObject.convert(widgetData.ContactInfo)).toEqual('(testemail@test.com)');
        expect(PDFObject.convert(widgetData.Name)).toEqual('(test name)');
        expect(PDFObject.convert(widgetData.Location)).toEqual('(test Location)');
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
            reason: 'test reason',
        });
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        const widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(PDFObject.convert(widgetData.ContactInfo)).toEqual('(emailfromp1289@gmail.com)');
        expect(PDFObject.convert(widgetData.Name)).toEqual('(Name from p12)');
        expect(PDFObject.convert(widgetData.Location)).toEqual('(Location from p12)');
        expect(widgetData.SubFilter).toEqual('adbe.pkcs7.detached');
    });

    it('allows defining signature SubFilter', () => {
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
            subFilter: SUBFILTER_ETSI_CADES_DETACHED,
        });
        expect(Object.keys(refs)).toMatchSnapshot();
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        const widget = pdf.page.dictionary.data.Annots[0];
        expect(widget.data.Subtype).toEqual('Widget');
        const widgetData = widget.data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(widgetData.SubFilter).toEqual('ETSI.CAdES.detached');
    });
});
