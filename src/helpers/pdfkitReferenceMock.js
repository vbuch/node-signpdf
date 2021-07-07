import PDFAbstractReference from './pdfkit/abstract_reference';

class PDFKitReferenceMock extends PDFAbstractReference {
    constructor(index, additionalData = undefined) {
        super();
        this.index = index;
        this.data = {};
        if (typeof additionalData !== 'undefined') {
            Object.assign(this.data, additionalData);
        }
    }

    toString() {
        return `${this.index} 0 R`;
    }
}

export default PDFKitReferenceMock;
