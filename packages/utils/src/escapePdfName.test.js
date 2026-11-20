import {PDFName} from 'pdf-lib';
import {escapePdfName} from './escapePdfName';

describe(escapePdfName, () => {
    it('leaves regular names unchanged', () => {
        expect(escapePdfName('signpdf')).toBe('signpdf');
        expect(escapePdfName('app-name-signpdf')).toBe('app-name-signpdf');
        expect(escapePdfName('Adobe.PPKLite')).toBe('Adobe.PPKLite');
    });
    it('escapes whitespace', () => {
        expect(escapePdfName('My App')).toBe('My#20App');
        expect(escapePdfName('a\tb\nc')).toBe('a#09b#0Ac');
    });
    it('escapes delimiters and the number sign', () => {
        expect(escapePdfName('()<>[]{}/%#')).toBe('#28#29#3C#3E#5B#5D#7B#7D#2F#25#23');
    });
    it('escapes non-ASCII characters as UTF-8 bytes', () => {
        expect(escapePdfName('Résumé (signer)')).toBe('R#C3#A9sum#C3#A9#20#28signer#29');
    });
    it('round-trips through pdf-lib without changing the name', () => {
        ['My App', 'Résumé (signer)', '()<>[]{}/%#', 'a\tb\nc'].forEach((name) => {
            const escaped = escapePdfName(name);
            const parsed = PDFName.of(escaped);
            // pdf-lib keeps the decoded bytes one char per byte.
            expect(parsed.decodeText()).toBe(Buffer.from(name, 'utf8').toString('latin1'));
            // Reserializing must not re-escape our escapes (e.g. #c3 -> #23c3).
            expect(parsed.asString()).toBe(`/${escaped}`);
        });
    });
});
