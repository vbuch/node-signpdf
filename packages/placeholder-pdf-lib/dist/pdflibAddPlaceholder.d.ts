export function pdflibAddPlaceholder({ pdfDoc, reason, contactInfo, name, location, signatureLength, byteRangePlaceholder, subFilter, widgetRect, }: InputType): void;
export type PDFDocument = import('pdf-lib').PDFDocument;
export type InputType = {
    pdfDoc: PDFDocument;
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
//# sourceMappingURL=pdflibAddPlaceholder.d.ts.map