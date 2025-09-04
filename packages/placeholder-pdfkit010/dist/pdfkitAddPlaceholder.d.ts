export function pdfkitAddPlaceholder({ pdf, pdfBuffer, reason, contactInfo, name, location, signingTime, signatureLength, byteRangePlaceholder, subFilter, widgetRect, appName, }: InputType): ReturnType;
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
    signingTime?: Date;
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
    /**
     * Name of the application generating the signature
     */
    appName?: string;
};
export type ReturnType = {
    signature: any;
    form: any;
    widget: any;
};
//# sourceMappingURL=pdfkitAddPlaceholder.d.ts.map