import {
    PDFArray, PDFDict, PDFDocument, PDFName, PDFObjectParser, PDFStream, PDFString,
} from 'pdf-lib';
import {readTestResource} from '@signpdf/internal-utils';
import {DEFAULT_BYTE_RANGE_PLACEHOLDER, SUBFILTER_ETSI_CADES_DETACHED, SignPdfError} from '@signpdf/utils';
import {pdflibAddPlaceholder} from './pdflibAddPlaceholder';

// Helper function to convert the added signatureDict (as a PDFInvalidObject)
// back to a PDFDict.
function parseObject(doc, obj) {
    const bytes = new Uint8Array(obj.sizeInBytes());
    obj.copyBytesInto(bytes, 0);
    const parser = PDFObjectParser.forBytes(bytes, doc.context);
    return parser.parseObject();
}

describe(pdflibAddPlaceholder, () => {
    const defaults = {
        reason: 'Because I can',
        contactInfo: 'testemail@example.com',
        name: 'test name',
        location: 'test Location',
    };

    it('expects a pdf document or page', async () => {
        try {
            pdflibAddPlaceholder(defaults);
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"PDFDoc or PDFPage must be set."');
        }
    });
    it('adds placeholder to a prepared document', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });
        // Convert the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save({useObjectStreams: false});
        // and then to buffer
        const buffer = Buffer.from(pdfBytes);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.indexOf('/ByteRange')).not.toBe(-1);
        expect(buffer.indexOf('/Subtype /Widget')).not.toBe(-1);
        expect(buffer.indexOf('/Filter /Adobe.PPKLite')).not.toBe(-1);
    });

    it('adds placeholder to a prepared page', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const pdfPage = pdfDoc.getPages()[0];

        pdflibAddPlaceholder({
            pdfPage,
            ...defaults,
        });
        // Convert the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();
        // and then to buffer
        const buffer = Buffer.from(pdfBytes);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.indexOf('/ByteRange')).not.toBe(-1);
        expect(buffer.indexOf('/Filter /Adobe.PPKLite')).not.toBe(-1);
    });

    it('allows defining signature SubFilter', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
            subFilter: SUBFILTER_ETSI_CADES_DETACHED,
        });
        // Convert the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();
        // and then to buffer
        const buffer = Buffer.from(pdfBytes);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.indexOf(`/SubFilter /${SUBFILTER_ETSI_CADES_DETACHED}`)).not.toBe(-1);
    });

    it('placeholder contains reason, contactInfo, name, location', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
         */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
         * @type {PDFDict}
         */
        const widgetData = parseObject(pdfDoc, widget.lookup(PDFName.of('V')));

        expect(widget.get(PDFName.of('Subtype'))).toEqual(PDFName.of('Widget'));
        expect(widgetData.get(PDFName.of('Reason'))).toEqual(PDFString.of(defaults.reason));
        expect(widgetData.get(PDFName.of('ContactInfo'))).toEqual(PDFString.of(defaults.contactInfo));
        expect(widgetData.get(PDFName.of('Location'))).toEqual(PDFString.of(defaults.location));
        expect(widgetData.get(PDFName.of('Name'))).toEqual(PDFString.of(defaults.name));
    });

    it('allows defining signing time', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const signingTime = new Date(2023, 11, 0, 11, 0, 0);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
            signingTime,
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
         */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
         * @type {PDFDict}
         */
        const widgetData = parseObject(pdfDoc, widget.lookup(PDFName.of('V')));

        expect(widget.get(PDFName.of('Subtype'))).toEqual(PDFName.of('Widget'));
        expect(widgetData.get(PDFName.of('M'))).toEqual(PDFString.fromDate(signingTime));
    });

    it('sets the widget rectange to invisible by default', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
        */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
        * @type {PDFArray}
        */
        const rect = widget.get(PDFName.of('Rect'));
        expect(rect).toBeInstanceOf(PDFArray);
        expect(rect.toString()).toEqual('[ 0 0 0 0 ]');
    });

    it('allows defining widget rectange', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const widgetRect = [100, 100, 200, 200];

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
            widgetRect,
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
        */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
        * @type {PDFArray}
        */
        const rect = widget.get(PDFName.of('Rect'));
        expect(rect).toBeInstanceOf(PDFArray);
        expect(rect.toString()).toEqual('[ 100 100 200 200 ]');
    });

    it('sets an appearance stream for the signature widget', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const widgetRect = [100, 100, 200, 200];

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
            widgetRect,
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
         */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
         * @type {PDFStream}
         */
        const apStream = widget.get(PDFName.of('AP')).lookup(PDFName.of('N'), PDFStream);

        expect(widget.get(PDFName.of('Subtype'))).toEqual(PDFName.of('Widget'));
        expect(apStream.dict.get(PDFName.of('BBox')).toString()).toEqual('[ 100 100 200 200 ]');
    });

    it('sets the Prop_Build dictionary for the signature', async () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
            appName: 'signpdf',
        });

        /**
         * @type {PDFArray}
         */
        const annots = pdfDoc.getPage(0).node.lookup(PDFName.of('Annots'));

        /**
         * @type {PDFDict}
         */
        const widget = annots.lookup(annots.size() - 1, PDFDict);

        /**
         * @type {PDFDict}
         */
        const widgetData = parseObject(pdfDoc, widget.lookup(PDFName.of('V')));

        /**
         * @type {PDFDict}
         */
        const propBuild = widgetData.get(PDFName.of('Prop_Build'));

        expect(widget.get(PDFName.of('Subtype'))).toEqual(PDFName.of('Widget'));
        expect(propBuild.get(PDFName.of('Filter')).get(PDFName.of('Name'))).toEqual(PDFName.of('Adobe.PPKLite'));
        expect(propBuild.get(PDFName.of('App')).get(PDFName.of('Name'))).toEqual(PDFName.of('signpdf'));
    });

    it('does not overwrite the AcroForm when it was already there', async () => {
        const input = readTestResource('signed-once.pdf');
        expect(input.indexOf('/ByteRange')).not.toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const existingAcroFormTag = pdfDoc.catalog.get(PDFName.of('AcroForm')).tag;

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        const newAcroFormRef = pdfDoc.catalog.get(PDFName.of('AcroForm'));
        expect(newAcroFormRef.tag).toBe(existingAcroFormTag);
    });

    it('does not overwrite page annotations when there already were some', async () => {
        const input = readTestResource('signed-once.pdf');
        expect(input.indexOf('/ByteRange')).not.toBe(-1);
        const pdfDoc = await PDFDocument.load(input);
        const existingAnnotations = pdfDoc
            .getPage(0).node
            .lookup(PDFName.of('Annots'), PDFArray)
            .asArray().map((v) => v.toString());

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        const newAnnotations = pdfDoc
            .getPage(0).node
            .lookup(PDFName.of('Annots'), PDFArray)
            .asArray().map((v) => v.toString());
        expect(newAnnotations).toEqual(expect.arrayContaining(existingAnnotations));
        expect(newAnnotations).toHaveLength(existingAnnotations.length + 1);
    });

    it('adds placeholder to PDFDocument document when AcroForm is already there', async () => {
        const input = readTestResource('signed-once.pdf');
        expect(input.indexOf('/ByteRange')).not.toBe(-1);
        const pdfDoc = await PDFDocument.load(input);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        const annotations = pdfDoc
            .getPage(0).node
            .lookup(PDFName.of('Annots'), PDFArray);
        const widgetDict = annotations.lookup(annotations.size() - 1, PDFDict);
        expect(widgetDict.get(PDFName.of('Subtype'))).toEqual(PDFName.of('Widget'));

        const signatureDict = parseObject(pdfDoc, widgetDict.lookup(PDFName.of('V')));
        const byteRange = signatureDict
            .lookup(PDFName.of('ByteRange'), PDFArray)
            .asArray()
            .map((v) => v.toString());

        expect(byteRange).toEqual([
            '0',
            PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER).asString(),
            PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER).asString(),
            PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER).asString(),
        ]);
    });
    it('creates a new AcroForm Fields array when missing', async () => {
        const input = readTestResource('w3dummy.pdf');
        const pdfDoc = await PDFDocument.load(input);

        const acroForm = pdfDoc.context.obj({});
        const acroFormRef = pdfDoc.context.register(acroForm);
        pdfDoc.catalog.set(PDFName.of('AcroForm'), acroFormRef);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        const finalAcroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
        const fields = finalAcroForm.lookup(PDFName.of('Fields'), PDFArray);

        expect(fields).toBeInstanceOf(PDFArray);
        expect(fields.size()).toBe(1);
    });

    it('replaces invalid AcroForm Fields with a new PDFArray', async () => {
        const input = readTestResource('w3dummy.pdf');
        const pdfDoc = await PDFDocument.load(input);

        const acroForm = pdfDoc.context.obj({Fields: pdfDoc.context.obj({Invalid: true})});
        const acroFormRef = pdfDoc.context.register(acroForm);
        pdfDoc.catalog.set(PDFName.of('AcroForm'), acroFormRef);

        pdflibAddPlaceholder({
            pdfDoc,
            ...defaults,
        });

        const finalAcroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
        const fields = finalAcroForm.lookup(PDFName.of('Fields'), PDFArray);

        expect(fields).toBeInstanceOf(PDFArray);
        expect(fields.size()).toBe(1);
    });
});
