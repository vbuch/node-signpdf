import * as utils from './index';

describe('index exports', () => {
    it('exports all required utilities', () => {
        // Check that all expected exports are present
        expect(utils.convertBuffer).toBeDefined();
        expect(utils.extractSignature).toBeDefined();
        expect(utils.findByteRange).toBeDefined();
        expect(utils.removeTrailingNewLine).toBeDefined();
        expect(utils.SignPdfError).toBeDefined();
        expect(utils.Signer).toBeDefined();
        expect(utils.PDFObject).toBeDefined();
        expect(utils.PDFAbstractReference).toBeDefined();
        expect(utils.PDFKitReferenceMock).toBeDefined();

        // Check that functions work as expected
        expect(typeof utils.convertBuffer).toBe('function');
        expect(typeof utils.extractSignature).toBe('function');
        expect(typeof utils.findByteRange).toBe('function');
        expect(typeof utils.removeTrailingNewLine).toBe('function');
        expect(typeof utils.SignPdfError).toBe('function');
        expect(typeof utils.Signer).toBe('function');
        expect(typeof utils.PDFObject).toBe('function');
        expect(typeof utils.PDFAbstractReference).toBe('function');
        expect(typeof utils.PDFKitReferenceMock).toBe('function');

        // Verify constants are exported
        expect(utils.DEFAULT_BYTE_RANGE_PLACEHOLDER).toBeDefined();
        expect(utils.DEFAULT_SIGNATURE_LENGTH).toBeDefined();
        expect(typeof utils.DEFAULT_BYTE_RANGE_PLACEHOLDER).toBe('string');
        expect(typeof utils.DEFAULT_SIGNATURE_LENGTH).toBe('number');
    });

    it('can instantiate and use exported classes', () => {
        // Test that the classes can be instantiated
        const signer = new utils.Signer();
        expect(signer).toBeInstanceOf(utils.Signer);

        const error = new utils.SignPdfError('test');
        expect(error).toBeInstanceOf(utils.SignPdfError);
        expect(error.message).toBe('test');

        const mock = new utils.PDFKitReferenceMock(1, 0);
        expect(mock).toBeInstanceOf(utils.PDFKitReferenceMock);
        expect(mock.toString()).toBe('1 0 R');
    });

    it('can use exported utility functions', () => {
        // Test the utility functions work
        expect(utils.convertBuffer(Buffer.from('test'))).toEqual(Buffer.from('test'));
        expect(utils.removeTrailingNewLine(Buffer.from('test\n%%EOF'))).toEqual(Buffer.from('test\n%%EOF'));

        // Test PDFObject convert method
        expect(utils.PDFObject.convert(42)).toBe(42);
        expect(utils.PDFObject.convert('hello')).toBe('/hello');
    });
});
