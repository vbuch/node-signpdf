export function pdfkitAddPlaceholder({ pdf, pdfBuffer, reason, contactInfo, name, location, signatureLength, byteRangePlaceholder, subFilter, widgetRect, }: InputType): ReturnType;
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
     * One of SUBFILTER_* from \@signpdf/utils
     */
    subFilter?: string;
    /**
     * [x1, y1, x2, y2] widget rectangle
     */
    widgetRect?: number[];
};
export type ReturnType = {
    signature: any;
    form: any;
    widget: any;
};
//# sourceMappingURL=pdfkitAddPlaceholder.d.ts.map