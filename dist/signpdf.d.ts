export { default as SignPdfError } from "./SignPdfError";
export * from "./helpers";
export * from "./helpers/const";
export class SignPdf {
    byteRangePlaceholder: string;
    lastSignature: string;
    sign(pdfBuffer: any, p12Buffer: any, additionalOptions?: {}): Buffer;
}
declare const _default: SignPdf;
export default _default;
//# sourceMappingURL=signpdf.d.ts.map