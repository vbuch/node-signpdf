export function getLastTrailerPosition(pdf: any): number;
export function getXref(pdf: any, position: any): {
    size: any;
    prev: string;
    xRefContent: Map<number, number>;
};
export function getFullXrefTable(pdf: Buffer): FullXrefTable;
export default readRefTable;
export type FullXrefTable = Map<number, number>;
export type ReadRefTableReturnType = {
    startingIndex: number;
    maxIndex: number;
    offsets: FullXrefTable;
};
/**
 * @typedef {object} ReadRefTableReturnType
 * @prop {number} startingIndex
 * @prop {number} maxIndex
 * @prop {FullXrefTable} offsets
 */
/**
 * @param {Buffer} pdfBuffer
 * @returns {ReadRefTableReturnType}
 */
declare function readRefTable(pdf: any): ReadRefTableReturnType;
//# sourceMappingURL=readRefTable.d.ts.map