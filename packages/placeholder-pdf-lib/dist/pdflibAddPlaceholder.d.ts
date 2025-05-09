export function pdflibAddPlaceholder({ pdfDoc, pdfPage, reason, contactInfo, name, location, signingTime, signatureLength, byteRangePlaceholder, subFilter, widgetRect, appName, widgetName, signDescription, newPageDims, visualRepresentation, }: InputType): void;
export type PDFDocument = import('@adnsistemas/pdf-lib').PDFDocument;
export type PDFPage = import('@adnsistemas/pdf-lib').PDFPage;
export type signaturePDFLibVisualRep = (pdfDoc: any, pdfPage: any, reason: any, contactInfo: any, name: any, location: any, signingTime: any) => void;
export type CommonInputType = {
    pdfDoc?: PDFDocument;
    pdfPage?: PDFPage;
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
    /**
     * Name to use for the Widget representing the signature, 'Signature1' if not specified
     */
    widgetName?: string;
    /**
     * Descriptive texto to show for widget on visualization, instead of widgetName
     */
    signDescription?: string;
    /**
     * If not specified page[0] is used for signature, otherwise a new page, with this dimensiones is used
     */
    newPageDims?: number[];
    /**
     * If provided, and new page is generated, is invoked to put the visual representation of the signature, on the new page
     */
    visualRepresentation?: signaturePDFLibVisualRep;
};
export type DocInputType = {
    pdfDoc: PDFDocument;
};
export type PageInputType = {
    pdfPage: PDFPage;
};
export type InputType = CommonInputType & (DocInputType | PageInputType);
//# sourceMappingURL=pdflibAddPlaceholder.d.ts.map