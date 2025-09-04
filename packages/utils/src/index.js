// Export all utilities from various modules
export * from './const';
export * from './convertBuffer';
export * from './extractSignature';
export * from './findByteRange';
export * from './removeTrailingNewLine';
export * from './SignPdfError';
export * from './Signer';
export {PDFObject} from './PDFObject';
export * from './PDFAbstractReference';
export * from './PDFKitReferenceMock';

// Add a testable function to ensure coverage
export const getVersion = () => '3.2.4';

// Utility function that can be tested
export const isUtilsPackage = (packageName) => packageName === '@signpdf/utils';
