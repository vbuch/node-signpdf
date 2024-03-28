export function plainAddPlaceholder({ pdfBuffer, reason, contactInfo, name, location, signingTime, signatureLength, subFilter, widgetRect, widgetPage, appName, }: InputType): Buffer;
export type InputType = {
    pdfBuffer: Buffer;
    reason: string;
    contactInfo: string;
    name: string;
    location: string;
    signingTime?: Date;
    signatureLength?: number;
    /**
     * One of SUBFILTER_* from \@signpdf/utils
     */
    subFilter?: string;
    /**
     * [x1, y1, x2, y2] widget rectangle
     */
    widgetRect?: number[];
    /**
     * Page number where the widget should be placed
     */
    widgetPage?: number;
    /**
     * Name of the application generating the signature
     */
    appName?: string;
};
//# sourceMappingURL=plainAddPlaceholder.d.ts.map