export default extractSignature;
/**
 * Basic implementation of signature extraction.
 *
 * Really basic. Would work in the simplest of cases where there is only one signature
 * in a document and ByteRange is only used once in it.
 *
 * @param {Buffer} pdf
 * @returns {Object} {ByteRange: Number[], signature: Buffer, signedData: Buffer}
 */
declare function extractSignature(pdf: Buffer, signatureCount?: number): any;
//# sourceMappingURL=extractSignature.d.ts.map