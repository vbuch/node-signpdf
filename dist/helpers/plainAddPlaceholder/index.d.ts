export default plainAddPlaceholder;
/**
 * Adds a signature placeholder to a PDF Buffer.
 *
 * This contrasts with the default pdfkit-based implementation.
 * Parsing is done using simple string operations.
 * Adding is done with `Buffer.concat`.
 * This allows node-signpdf to be used on any PDF and
 * not only on a freshly created through PDFKit one.
 */
declare function plainAddPlaceholder({ pdfBuffer, reason, contactInfo, name, location, signatureLength, subFilter, }: {
    pdfBuffer: any;
    reason: any;
    contactInfo?: string;
    name?: string;
    location?: string;
    signatureLength?: number;
    subFilter?: string;
}): Buffer;
//# sourceMappingURL=index.d.ts.map