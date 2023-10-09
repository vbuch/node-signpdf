export function pdfkitAddPlaceholder({ pdf, pdfBuffer, reason, contactInfo, name, location, signatureLength, byteRangePlaceholder, subFilter, }: InputType): ReturnType;
export type InputType = {
    /**
     * PDFDocument
     */
    pdf: object;
    pdfBuffer: Buffer;
    reason: string;
    contactInfo: string;
    name: string;
    location: string;
    signatureLength?: number;
    byteRangePlaceholder?: string;
    /**
     * One of SUBFILTER_* from
     */
    subFilter?: string;
};
export type ReturnType = {
    signature: any;
    form: any;
    widget: any;
};
//# sourceMappingURL=pdfkitAddPlaceholder.d.ts.map