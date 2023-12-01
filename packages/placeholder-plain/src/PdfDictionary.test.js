import {SignPdfError} from '@signpdf/utils';
import PdfDictionary from './PdfDictionary';

describe(PdfDictionary, () => {
    it('Throws an error when dictionary is not valid', () => {
        const dictionary = Buffer.from('Not a dictionary.');
        try {
            // eslint-disable-next-line no-new
            new PdfDictionary(dictionary);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"Failed to parse PDF dictionary: Failed to parse key in dictionary."');
        }
    });
    it('Parses a dictionary', () => {
        const dictionary = Buffer.from('   /Type /Catalog /Pages 2 0 R ');
        const pdfDictionary = new PdfDictionary(dictionary);

        expect(pdfDictionary.get('/Type')).toBe('/Catalog');
        expect(pdfDictionary.get('/Pages')).toBe('2 0 R');
    });
    it('Parses a dictionary with spaces and different types of values', () => {
        const dictionary = Buffer.from(`
        /Key1 /Catalog
        /Key2 2 0 R
        /Key3        [3 0 R]
        /Key4/Value
        /Key5 (Value)
        /Key6 <</Subkey1 /Subvalue1>> # Subdictionary to mess things up
        /Key7/Value7/Key8/Value8 # Multiple keys in a row and a comment
        /Key9
        /Value9`);
        const pdfDictionary = new PdfDictionary(dictionary);

        expect(pdfDictionary.get('/Key1')).toBe('/Catalog');
        expect(pdfDictionary.get('/Key2')).toBe('2 0 R');
        expect(pdfDictionary.get('/Key3')).toBe('[3 0 R]');
        expect(pdfDictionary.get('/Key4')).toBe('/Value');
        expect(pdfDictionary.get('/Key5')).toBe('(Value)');
        expect(pdfDictionary.get('/Key6')).toBe('<</Subkey1 /Subvalue1>>');
        expect(pdfDictionary.get('/Key7')).toBe('/Value7');
        expect(pdfDictionary.get('/Key8')).toBe('/Value8');
        expect(pdfDictionary.get('/Key9')).toBe('/Value9');
    });
});
