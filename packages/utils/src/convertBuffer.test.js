import {convertBuffer} from './convertBuffer';
import {SignPdfError} from './SignPdfError';

describe(convertBuffer, () => {
    it('expects an error if input is not a Buffer, Uint8Array or string', () => {
        try {
            convertBuffer(['non-buffer'], 'Input');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
            expect(e.message).toMatchInlineSnapshot('"Input expected as Buffer, Uint8Array or base64-encoded string."');
        }
    });
    it('converts Buffer to Buffer', () => {
        const data = 'test';
        const input = Buffer.from(data); // Data as Buffer
        const buffer = convertBuffer(input, 'Input');
        expect(buffer instanceof Buffer).toBe(true);
        expect(buffer.toString()).toBe(data);
    });
    it('converts Uint8Array to Buffer', () => {
        const data = 'test';
        const encoder = new TextEncoder();
        const input = encoder.encode(data); // Data as Uint8Array
        const buffer = convertBuffer(input, 'Input');
        expect(buffer instanceof Buffer).toBe(true);
        expect(buffer.toString()).toBe(data);
    });
    it('converts string to Buffer', () => {
        const data = 'test';
        const input = Buffer.from(data).toString('base64'); // Data as base64 string
        const buffer = convertBuffer(input, 'Input');
        expect(buffer instanceof Buffer).toBe(true);
        expect(buffer.toString()).toBe(data);
    });
});
