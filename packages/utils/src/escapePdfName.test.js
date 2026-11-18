import {escapePdfName} from './escapePdfName';

describe(escapePdfName, () => {
    it('leaves regular names unchanged', () => {
        expect(escapePdfName('signpdf')).toBe('signpdf');
        expect(escapePdfName('app-name-signpdf')).toBe('app-name-signpdf');
        expect(escapePdfName('Adobe.PPKLite')).toBe('Adobe.PPKLite');
    });
    it('escapes whitespace', () => {
        expect(escapePdfName('My App')).toBe('My#20App');
        expect(escapePdfName('a\tb\nc')).toBe('a#09b#0ac');
    });
    it('escapes delimiters and the number sign', () => {
        expect(escapePdfName('()<>[]{}/%#')).toBe('#28#29#3c#3e#5b#5d#7b#7d#2f#25#23');
    });
    it('escapes non-ASCII characters as UTF-8 bytes', () => {
        expect(escapePdfName('Résumé (signer)')).toBe('R#c3#a9sum#c3#a9#20#28signer#29');
    });
});
