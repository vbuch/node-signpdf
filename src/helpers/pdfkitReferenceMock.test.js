import PDFKitReferenceMock from './pdfkitReferenceMock';

describe('pdfkitReferenceMock', () => {
    it('stores index', () => {
        const index = 54321;
        const instance = new PDFKitReferenceMock(index);
        expect(instance.index).toBe(index);
    });
    it('accepts and stores additional data', () => {
        const index = 123;
        const data = 'DATA';
        const instance = new PDFKitReferenceMock(index, {a: data, b: data});
        expect(instance.index).toBe(index);
        expect(instance.a).toBe(data);
        expect(instance.b).toBe(data);
    });
    it('can be converted to string', () => {
        const index = 123;
        const instance = new PDFKitReferenceMock(index);
        expect(instance.toString()).toMatchSnapshot();
    });
});
