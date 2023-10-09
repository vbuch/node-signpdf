import PDFAbstractReference from './pdfkit/abstract_reference';

export class PDFKitReferenceMock extends PDFAbstractReference {
    constructor(index, additionalData = undefined) {
        super();
        this.index = index;
        if (typeof additionalData !== 'undefined') {
            Object.assign(this, additionalData);
        }
    }

    toString() {
        return `${this.index} 0 R`;
    }
}
