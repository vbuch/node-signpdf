export class ISigner {
    /**
     * @param {Buffer} pdfBuffer
     * @param {Date | undefined} signingTime
     * @returns {Promise<Buffer>}
     */
    sign(pdfBuffer: Buffer, signingTime?: Date | undefined): Promise<Buffer>;
}
//# sourceMappingURL=ISigner.d.ts.map