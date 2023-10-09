export function getLastTrailerPosition(pdf: any): number;
export function getXref(pdf: any, position: any): {
    size: any;
    prev: string;
    xRefContent: Map<any, any>;
};
export function getFullXrefTable(pdf: Buffer): GetFullXrefTableReturnType;
export default readRefTable;
export type GetFullXrefTableReturnType = Map<any, any>;
export type ReadRefTableReturnType = {
    startingIndex: number;
    maxIndex: number;
    offsets: GetFullXrefTableReturnType;
};
/**
 * @typedef {object} ReadRefTableReturnType
 * @prop {number} startingIndex
 * @prop {number} maxIndex
 * @prop {GetFullXrefTableReturnType} offsets
 */
/**
 * @param {Buffer} pdfBuffer
 * @returns {ReadRefTableReturnType}
 */
declare function readRefTable(pdf: any): ReadRefTableReturnType;
//# sourceMappingURL=readRefTable.d.ts.map