/**
 * @type {(pdf: Buffer, signatureCount: number) => ExtractSignatureResult}
 * @deprecated Should be used from internal-utils. Will be removed in a major release.
 */
export const extractSignature: (pdf: Buffer, signatureCount: number) => ExtractSignatureResult;
export type ExtractSignatureResult = {
    ByteRange: number[];
    signature: Buffer;
    signedData: Buffer;
};
//# sourceMappingURL=extractSignature.d.ts.map