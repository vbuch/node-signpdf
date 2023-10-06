import {getValue} from './readPdf';

describe(getValue, () => {
    it('matches snapshots', () => {
        const trailer = Buffer.from(`trailer
        <<
        /Size 14
        /Root 2 0 R
        /Info 10 0 R
        /ID [<455364dbb1253da25540322def2a672b> <455364dbb1253da25540322def2a672b>]
        /AtTheEnd 14
        >>
        startxref
        4220
        %%EOF`);

        expect(getValue(trailer, '/Root')).toBe('2 0 R');
        expect(getValue(trailer, '/Info')).toBe('10 0 R');
        expect(getValue(trailer, '/Unknown')).toBe(undefined);
        expect(getValue(trailer, '/AtTheEnd')).toBe('14');
    });
});
