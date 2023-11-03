export function plainAddPlaceholder({ pdfBuffer, reason, contactInfo, name, location, signatureLength, subFilter, widgetRect, }: InputType): Buffer;
export type InputType = {
    pdfBuffer: Buffer;
    reason: string;
    contactInfo: string;
    name: string;
    location: string;
    signatureLength?: number;
    /**
     * One of SUBFILTER_* from \@signpdf/utils
     */
    subFilter?: string;
    /**
     * [x1, y1, x2, y2] widget rectangle
     */
    widgetRect?: number[];
};
//# sourceMappingURL=plainAddPlaceholder.d.ts.map