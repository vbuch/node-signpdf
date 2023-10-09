export const ERROR_TYPE_UNKNOWN: 1;
export const ERROR_TYPE_INPUT: 2;
export const ERROR_TYPE_PARSE: 3;
export const ERROR_VERIFY_SIGNATURE: 4;
export class SignPdfError extends Error {
    constructor(msg: any, type?: number);
    type: number;
}
export namespace SignPdfError {
    export { ERROR_TYPE_UNKNOWN as TYPE_UNKNOWN };
    export { ERROR_TYPE_INPUT as TYPE_INPUT };
    export { ERROR_TYPE_PARSE as TYPE_PARSE };
    export { ERROR_VERIFY_SIGNATURE as VERIFY_SIGNATURE };
}
//# sourceMappingURL=SignPdfError.d.ts.map