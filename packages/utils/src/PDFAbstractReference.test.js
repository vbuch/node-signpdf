import {PDFAbstractReference} from './PDFAbstractReference';

class TestPDFReference extends PDFAbstractReference {
    constructor(id, generation) {
        super();
        this.id = id;
        this.generation = generation;
    }

    toString() {
        return `${this.id} ${this.generation} R`;
    }
}

describe('PDFAbstractReference', () => {
    it('can be extended and implements toString', () => {
        const ref = new TestPDFReference(42, 0);
        expect(ref).toBeInstanceOf(PDFAbstractReference);
        expect(ref.toString()).toBe('42 0 R');
    });

    it('throws error when toString is not implemented', () => {
        class IncompletePDFReference extends PDFAbstractReference {
            // No toString implementation
        }
        
        const ref = new IncompletePDFReference();
        expect(() => ref.toString()).toThrow('Must be implemented by subclasses');
    });

    it('can be used in instanceof checks', () => {
        const ref = new TestPDFReference(123, 1);
        expect(ref instanceof PDFAbstractReference).toBe(true);
    });
});