import {readTestResource} from '@signpdf/internal-utils';
import {plainAddPlaceholder} from './plainAddPlaceholder';

describe(plainAddPlaceholder, () => {
    it('adds placeholder to a prepared document', () => {
        const input = readTestResource('w3dummy.pdf');
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
            location: 'some place',
            name: 'example name',
            contactInfo: 'emailfromp1289@gmail.com',
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/ByteRange')).not.toBe(-1);
    });

    it('adds placeholder when there already is one', () => {
        const input = readTestResource('signed-once.pdf');
        expect(input.indexOf('/ByteRange')).toBe(13342);
        expect(input.indexOf('/ByteRange', 13350)).toBe(-1);

        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/ByteRange', 13350)).toBe(19489);
    });

    it('sets the widget rectange to invisible by default', () => {
        const input = readTestResource('w3dummy.pdf');
        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
            location: 'some place',
            name: 'example name',
            contactInfo: 'emailfromp1289@gmail.com',
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/Rect [0 0 0 0]')).not.toBe(-1);
    });

    it('allows defining widget rectange', () => {
        const input = readTestResource('w3dummy.pdf');
        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
            location: 'some place',
            name: 'example name',
            contactInfo: 'emailfromp1289@gmail.com',
            widgetRect: [100, 100, 200, 200],
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/Rect [100 100 200 200]')).not.toBe(-1);
    });

    it('sets the Prop_Build dictionary for the signature', async () => {
        const input = readTestResource('w3dummy.pdf');
        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
            location: 'some place',
            name: 'example name',
            contactInfo: 'emailfromp1289@gmail.com',
            widgetRect: [100, 100, 200, 200],
            appName: 'app-name-signpdf',
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/Name /Adobe.PPKLite')).not.toBe(-1);
        expect(output.indexOf('/Name /app-name-signpdf')).not.toBe(-1);
    });
});
