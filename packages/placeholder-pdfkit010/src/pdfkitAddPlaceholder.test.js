import {SIG_FLAGS, SUBFILTER_ADOBE_PKCS7_DETACHED, SUBFILTER_ETSI_CADES_DETACHED} from '@signpdf/utils';
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
        const form = pdf.ref({
            Type: 'AcroForm',
            SigFlags: SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
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

    it('parses field ids with wrapping spaces', () => {
        const {pdf} = createPdfkitDocument(PDFDocument, {});
        const fakeAcroFormStr = `
99 0 obj
<<
/Type /AcroForm
/SigFlags 3
/Fields [   12 0 R     13 0   R  ]
>>
endobj`;
        const fakeBuffer = Buffer.from(fakeAcroFormStr);
        const existingForm = pdf.ref({
            Type: 'AcroForm',
            SigFlags: SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
            Fields: [],
        });

        /* eslint-disable no-underscore-dangle */
        pdf._root.data.AcroForm = existingForm;

        const refs = pdfkitAddPlaceholder({
            ...defaults,
            pdf,
            pdfBuffer: fakeBuffer,
            reason: 'test reason',
        });

        const acroFormFields = refs.form.data.Fields;
        expect(acroFormFields).toHaveLength(3);
        expect(acroFormFields[0].index).toBe('12');
        expect(acroFormFields[1].index).toBe('13');
    });
});
