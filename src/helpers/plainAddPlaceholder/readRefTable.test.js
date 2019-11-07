import fs from 'fs';
import readRefTable from './readRefTable';
import SignPdfError from '../../SignPdfError';

describe('readRefTable', () => {
    it('Expects to merge correctly the refTable of resources/signed-once.pdf', () => {
        const pdf = fs.readFileSync(`${__dirname}/../../../resources/signed-once.pdf`);

        let r = readRefTable(pdf);
        expect(r.offsets.has(19)).toBe(true);
        expect(r.offsets.get(19)).toBe(18860);
    });
});