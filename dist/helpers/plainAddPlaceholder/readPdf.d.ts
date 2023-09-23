export default readPdf;
/**
 * Simplified parsing of a PDF Buffer.
 * Extracts reference table, root info and trailer start.
 *
 * See section 7.5.5 (File Trailer) of the PDF specs.
 *
 * @param {Buffer} pdfBuffer
 */
declare function readPdf(pdfBuffer: Buffer): {
    xref: any;
    rootRef: any;
    root: any;
    infoRef: any;
    trailerStart: number;
    previousXrefs: any[];
    xRefPosition: string;
};
//# sourceMappingURL=readPdf.d.ts.map