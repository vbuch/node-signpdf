import {SUBFILTER_ADOBE_PKCS7_DETACHED, SUBFILTER_ETSI_CADES_DETACHED} from '@signpdf/utils';
import {createPdfkitDocument} from '@signpdf/internal-utils';
import PDFDocument from 'pdfkit';
import {pdfkitAddPlaceholder} from './pdfkitAddPlaceholder';
import PDFObject from './pdfkit/pdfobject';

describe(pdfkitAddPlaceholder, () => {
    const defaults = {
        contactInfo: 'testemail@example.com',
        name: 'test name',
        location: 'test Location',
    };

    it('adds placeholder to PDFKit document', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});

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
        const {pdf} = createPdfkitDocument(PDFDocument, {});

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
        expect(PDFObject.convert(widgetData.ContactInfo)).toEqual(`(${defaults.contactInfo})`);
        expect(PDFObject.convert(widgetData.Name)).toEqual(`(${defaults.name})`);
        expect(PDFObject.convert(widgetData.Location)).toEqual(`(${defaults.location})`);
        expect(widgetData.SubFilter).toEqual(SUBFILTER_ADOBE_PKCS7_DETACHED);
    });

    it('allows defining signature SubFilter', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});

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
        expect(widgetData.SubFilter).toEqual(SUBFILTER_ETSI_CADES_DETACHED);
    });

    it('sets the widget rectange to invisible by default', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});
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
        const widget = pdf.page.dictionary.data.Annots[0];
        const rect = widget.data.Rect;
        expect(Array.isArray(rect)).toBe(true);
        expect(rect).toEqual([0, 0, 0, 0]);
    });

    it('allows defining widget rectange', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});
        const widgetRect = [100, 100, 200, 200];
        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
            widgetRect,
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        const widget = pdf.page.dictionary.data.Annots[0];
        const rect = widget.data.Rect;
        expect(Array.isArray(rect)).toBe(true);
        expect(rect).toEqual(widgetRect);
    });

    it('adds placeholder to PDFKit document when AcroForm is already there', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});
        pdf.initForm();

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

    it('sets the Prop_Build dictionary for the signature', async () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});
        const widgetRect = [100, 100, 200, 200];
        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: Buffer.from([pdf]),
            reason: 'test reason',
            widgetRect,
            appName: 'signpdf',
        });
        expect(Object.keys(refs)).toEqual(expect.arrayContaining([
            'signature',
            'form',
            'widget',
        ]));
        expect(pdf.page.dictionary.data.Annots).toHaveLength(1);
        const widget = pdf.page.dictionary.data.Annots[0];
        const propBuild = widget.data.V.data.Prop_Build;

        expect(propBuild.Filter.Name).toEqual('Adobe.PPKLite');
        expect(propBuild.App.Name).toEqual('signpdf');
    });
});
