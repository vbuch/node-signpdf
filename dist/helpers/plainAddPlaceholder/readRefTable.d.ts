export function getLastTrailerPosition(pdf: any): number;
export function getXref(pdf: any, position: any): {
    size: any;
    prev: string;
    xRefContent: Map<any, any>;
};
export function getFullXrefTable(pdf: any): any;
export default readRefTable;
/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */
declare function readRefTable(pdf: any): object;
//# sourceMappingURL=readRefTable.d.ts.map