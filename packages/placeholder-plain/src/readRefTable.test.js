import {readTestResource} from '@signpdf/internal-utils';
import {SignPdfError} from '@signpdf/utils';
import readRefTable, {getFullXrefTable, getXref} from './readRefTable';

describe(getFullXrefTable, () => {
    it('skips unreferenced xref tables', () => {
        const pdf = Buffer.from(`xref
0 3
0000000000 65535 f
0000000123 00000 n
0000000234 00000 n

xref
2 1
0000000555 00000 n

xref
0 1
0000000666 00000 n

trailer
<<
/Size 3
/Root 1 0 R
>>
startxref
0
%%EOF
`);

        expect(getFullXrefTable(pdf)).toEqual(new Map([
            [1, 123],
            [2, 234],
        ]));
    });
});

describe(getXref, () => {
    it('Throws an error when xref is not found at position', () => {
        const pdf = Buffer.from('Not containing an X R E F.');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"Could not find xref anywhere at or after startxref position 0."');
        }
    });
    it('Throws an error when xref is not at its expected position', () => {
        const pdf = Buffer.from('Contains xref but definetely not where expected.');
        const position = 2;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"Could not find xref anywhere at or after startxref position 2."');
        }
    });
    it('Throws an error when size is not found', () => {
        const pdf = Buffer.from('xref\n and there is no Size %%EOF');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"Size not found in xref table."');
        }
    });
    it('Throws an error when size has unexpected value', () => {
        const pdf = Buffer.from('xref\n and then somewhere here there is a /Size XXXX %%EOF');
        const position = 0;
        try {
            getXref(pdf, position);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchInlineSnapshot('"Failed to parse size of xref table."');
        }
    });
});

describe(readRefTable, () => {
    it.each([
        {resource: 'signed-once.pdf', startxref: 19174},
        {resource: 'signed-twice.pdf', startxref: 25264},
        {resource: 'contributing.pdf', startxref: 72203},
        {resource: 'formexample.pdf', startxref: 64251},
        {resource: 'incrementally_signed.pdf', startxref: 17125},
        {resource: 'signed.pdf', startxref: 4220},
        {resource: 'w3dummy.pdf', startxref: 12787},
    ])(
        'Expects to merge correctly the refTable of $resource',
        ({resource, startxref}) => {
            const pdf = readTestResource(resource);
            const r = readRefTable(pdf, startxref);
            expect(r).toMatchSnapshot(resource);
        },
    );
});
