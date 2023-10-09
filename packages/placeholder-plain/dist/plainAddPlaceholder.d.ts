export function plainAddPlaceholder({ pdfBuffer, reason, contactInfo, name, location, signatureLength, subFilter, }: InputType): Buffer;
export type InputType = {
    pdfBuffer: Buffer;
    reason: string;
    contactInfo: string;
    name: string;
    location: string;
    signatureLength?: number;
    /**
     * One of SUBFILTER_* from
     */
    subFilter?: string;
};
//# sourceMappingURL=plainAddPlaceholder.d.ts.map