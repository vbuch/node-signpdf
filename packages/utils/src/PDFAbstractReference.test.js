import {PDFAbstractReference} from './PDFAbstractReference';

// Factory function to create test references instead of using a class
const createTestReference = (id, generation) => {
    const ref = Object.create(PDFAbstractReference.prototype);
    ref.id = id;
    ref.generation = generation;
    ref.toString = function() {
        return `${this.id} ${this.generation} R`;
    };
    return ref;
};

describe('PDFAbstractReference', () => {
    it('can be extended and implements toString', () => {
        const ref = createTestReference(42, 0);
        expect(ref).toBeInstanceOf(PDFAbstractReference);
        expect(ref.toString()).toBe('42 0 R');
    });

    it('throws error when toString is not implemented', () => {
        // Create a class that doesn't implement toString inside the test
        const IncompletePDFReference = class extends PDFAbstractReference {
            // No toString implementation
        };

        const ref = new IncompletePDFReference();
        expect(() => ref.toString()).toThrow('Must be implemented by subclasses');
    });

    it('can be used in instanceof checks', () => {
        const ref = createTestReference(123, 1);
        expect(ref instanceof PDFAbstractReference).toBe(true);
    });

    it('has an end() method that is a no-op', () => {
        const ref = createTestReference(1, 0);
        // Should not throw any error
        expect(() => ref.end()).not.toThrow();
        // Should return undefined (no-op)
        expect(ref.end()).toBeUndefined();
    });
});
