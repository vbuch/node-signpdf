export function getValue(trailer: Buffer, key: string): string;
export default readPdf;
export type ReadPdfReturnType = {
    xref: import("./readRefTable").ReadRefTableReturnType;
    rootRef: string;
    root: Buffer;
    infoRef: string;
    trailerStart: number;
    previousXrefs: any[];
    xRefPosition: number;
};
/**
 * @typedef {object} ReadPdfReturnType
 * @prop {import("./readRefTable").ReadRefTableReturnType} xref
 * @prop {string} rootRef
 * @prop {Buffer} root
 * @prop {string} infoRef
 * @prop {number} trailerStart
 * @prop {*[]} previousXrefs
 * @prop {number} xRefPosition
 */
/**
 * Simplified parsing of a PDF Buffer.
 * Extracts reference table, root info and trailer start.
 *
 * See section 7.5.5 (File Trailer) of the PDF specs.
 *
 * @param {Buffer} pdfBuffer
 * @returns {ReadPdfReturnType}
 */
declare function readPdf(pdfBuffer: Buffer): ReadPdfReturnType;
//# sourceMappingURL=readPdf.d.ts.map