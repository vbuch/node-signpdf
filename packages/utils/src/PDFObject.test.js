import {PDFObject} from './PDFObject';
import {PDFAbstractReference} from './PDFAbstractReference';
import {PDFKitReferenceMock} from './PDFKitReferenceMock';

describe('PDFObject', () => {
    describe('convert', () => {
        it('converts numbers correctly', () => {
            expect(PDFObject.convert(42)).toBe(42);
            expect(PDFObject.convert(3.14159)).toBe(3.14159);
            expect(PDFObject.convert(0)).toBe(0);
            expect(PDFObject.convert(-1)).toBe(-1);
        });

        it('converts booleans correctly', () => {
            expect(PDFObject.convert(true)).toBe('true');
            expect(PDFObject.convert(false)).toBe('false');
        });

        it('converts null correctly', () => {
            expect(PDFObject.convert(null)).toBe('null');
        });

        it('converts primitive strings to PDF names', () => {
            expect(PDFObject.convert('hello')).toBe('/hello');
            expect(PDFObject.convert('')).toBe('/');
            expect(PDFObject.convert('test_string')).toBe('/test_string');
        });

        it('converts String objects to PDF strings with escaping', () => {
            expect(PDFObject.convert(new String('hello'))).toBe('(hello)');
            expect(PDFObject.convert(new String(''))).toBe('()');
            expect(PDFObject.convert(new String('line1\nline2'))).toBe('(line1\\nline2)');
            expect(PDFObject.convert(new String('tab\there'))).toBe('(tab\\there)');
            expect(PDFObject.convert(new String('return\rhere'))).toBe('(return\\rhere)');
            expect(PDFObject.convert(new String('backspace\bhere'))).toBe('(backspace\\bhere)');
            expect(PDFObject.convert(new String('formfeed\fhere'))).toBe('(formfeed\\fhere)');
            expect(PDFObject.convert(new String('paren(test)'))).toBe('(paren\\(test\\))');
            expect(PDFObject.convert(new String('backslash\\test'))).toBe('(backslash\\\\test)');
        });

        it('converts Buffers to hex strings', () => {
            const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
            expect(PDFObject.convert(buffer)).toBe('<48656c6c6f>');
            
            const emptyBuffer = Buffer.from([]);
            expect(PDFObject.convert(emptyBuffer)).toBe('<>');
        });

        it('converts PDFAbstractReference instances using toString', () => {
            const mockRef = new PDFKitReferenceMock(42, 0);
            expect(PDFObject.convert(mockRef)).toBe('42 0 R');
        });

        it('converts Date objects correctly', () => {
            const date = new Date('2023-01-15T10:30:45.000Z');
            expect(PDFObject.convert(date)).toBe('(D:20230115103045Z)');
        });

        it('converts arrays correctly', () => {
            expect(PDFObject.convert([1, 2, 3])).toBe('[1 2 3]');
            expect(PDFObject.convert(['hello', 'world'])).toBe('[/hello /world]');
            expect(PDFObject.convert([true, false, null])).toBe('[true false null]');
            expect(PDFObject.convert([])).toBe('[]');
        });

        it('converts mixed arrays correctly', () => {
            const mockRef = new PDFKitReferenceMock(123, 0);
            expect(PDFObject.convert([1, 'hello', true, mockRef])).toBe('[1 /hello true 123 0 R]');
        });

        it('converts objects/dictionaries correctly', () => {
            expect(PDFObject.convert({Type: 'Catalog'})).toBe('<<\n/Type /Catalog\n>>');
            expect(PDFObject.convert({Count: 1, Kids: []})).toBe('<<\n/Count 1\n/Kids []\n>>');
            expect(PDFObject.convert({})).toBe('<<\n>>');
        });

        it('converts complex nested objects correctly', () => {
            const mockRef = new PDFKitReferenceMock(42, 0);
            const complexObj = {
                Type: 'Page',
                Parent: mockRef,
                Resources: {
                    Font: {
                        F1: 'Helvetica'
                    }
                },
                MediaBox: [0, 0, 612, 792],
                Contents: Buffer.from([0x48, 0x69])
            };
            
            const result = PDFObject.convert(complexObj);
            expect(result).toContain('/Type /Page');
            expect(result).toContain('/Parent 42 0 R');
            expect(result).toContain('/MediaBox [0 0 612 792]');
            expect(result).toContain('/Contents <4869>');
        });

        it('handles encryption function when provided with String objects', () => {
            const encryptFn = jest.fn((buffer) => Buffer.from(buffer.toString().toUpperCase()));
            
            // Test with String object (not primitive string)
            const result = PDFObject.convert(new String('hello'), encryptFn);
            expect(encryptFn).toHaveBeenCalledWith(Buffer.from('hello', 'ascii'));
            expect(result).toBe('(HELLO)');
        });

        it('handles encryption function with dates', () => {
            const encryptFn = jest.fn((buffer) => buffer); // Pass through
            const date = new Date('2023-01-15T10:30:45.000Z');
            
            const result = PDFObject.convert(date, encryptFn);
            expect(encryptFn).toHaveBeenCalledWith(Buffer.from('D:20230115103045Z', 'ascii'));
            expect(result).toBe('(D:20230115103045Z)');
        });

        it('properly handles undefined values', () => {
            expect(PDFObject.convert(undefined)).toBe('undefined');
        });
    });

    describe('number', () => {
        it('handles normal numbers correctly', () => {
            expect(PDFObject.number(42)).toBe(42);
            expect(PDFObject.number(3.14159)).toBe(3.14159);
            expect(PDFObject.number(0)).toBe(0);
            expect(PDFObject.number(-1)).toBe(-1);
        });

        it('rounds numbers to 6 decimal places', () => {
            expect(PDFObject.number(1.1234567)).toBe(1.123457);
            expect(PDFObject.number(2.9999994)).toBe(2.999999);
        });

        it('handles boundary values', () => {
            expect(PDFObject.number(9.999999999999e20)).toBe(9.999999999999e20);
            expect(PDFObject.number(-9.999999999999e20)).toBe(-9.999999999999e20);
        });

        it('throws error for values outside supported range', () => {
            expect(() => PDFObject.number(1e21)).toThrow('unsupported number: 1e+21');
            expect(() => PDFObject.number(-1e21)).toThrow('unsupported number: -1e+21');
            expect(() => PDFObject.number(Infinity)).toThrow('unsupported number: Infinity');
        });
    });
});