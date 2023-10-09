import {SUBFILTER_ETSI_CADES_DETACHED} from '@signpdf/utils';
import {createPdfkitDocument} from '@signpdf/internal-utils';
import {pdfkitAddPlaceholder} from './pdfkitAddPlaceholder';
import PDFObject from './pdfkit/pdfobject';

describe(pdfkitAddPlaceholder, () => {
    const defaults = {
        contactInfo: 'testemail@example.com',
        name: 'test name',
        location: 'test Location',
    };

    it('adds placeholder to PDFKit document', () => {
        const {pdf} = createPdfkitDocument();

        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
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
        const {pdf} = createPdfkitDocument();

        const refs = pdfkitAddPlaceholder({
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
            ...defaults,
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        const widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(PDFObject.convert(widgetData.ContactInfo)).toEqual('(testemail@example.com)');
        expect(PDFObject.convert(widgetData.Name)).toEqual('(test name)');
        expect(PDFObject.convert(widgetData.Location)).toEqual('(test Location)');
    });

    it('placeholder contains default values for contactInfo, name, location', () => {
        const {pdf} = createPdfkitDocument();

        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        expect(pdf.page.dictionary.data.Annots[0].data.Subtype).toEqual('Widget');
        const widgetData = pdf.page.dictionary.data.Annots[0].data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(PDFObject.convert(widgetData.ContactInfo)).toEqual('(testemail@example.com)');
        expect(PDFObject.convert(widgetData.Name)).toEqual('(test name)');
        expect(PDFObject.convert(widgetData.Location)).toEqual('(test Location)');
        expect(widgetData.SubFilter).toEqual('adbe.pkcs7.detached');
    });

    it('allows defining signature SubFilter', () => {
        const {pdf} = createPdfkitDocument();

        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
            subFilter: SUBFILTER_ETSI_CADES_DETACHED,
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        const widget = pdf.page.dictionary.data.Annots[0];
        expect(widget.data.Subtype).toEqual('Widget');
        const widgetData = widget.data.V.data;
        expect(PDFObject.convert(widgetData.Reason)).toEqual('(test reason)');
        expect(widgetData.SubFilter).toEqual('ETSI.CAdES.detached');
    });

    it('adds placeholder to PDFKit document when AcroForm is already there', () => {
        const {pdf} = createPdfkitDocument();
        const form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: 3,
            Fields: [],
        });
        // eslint-disable-next-line no-underscore-dangle
        pdf._root.data.AcroForm = form;

        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
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
