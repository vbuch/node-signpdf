export default pdfkitAddPlaceholder;
/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {PDFDocument} pdf
 * @param {string} reason
 * @returns {object}
 */
declare function pdfkitAddPlaceholder({ pdf, pdfBuffer, reason, contactInfo, name, location, signatureLength, byteRangePlaceholder, subFilter, }: PDFDocument): object;
//# sourceMappingURL=pdfkitAddPlaceholder.d.ts.map