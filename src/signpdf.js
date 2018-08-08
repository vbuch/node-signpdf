import forge from 'node-forge';

const signpdf = (pdfBuffer, p12Buffer) => {
    if (!(pdfBuffer instanceof Buffer)) {
        throw new Error('PDF expected as Buffer.');
    }
    if (!(p12Buffer instanceof Buffer)) {
        throw new Error('p12 certificate expected as Buffer.');
    }
};

export default signpdf;