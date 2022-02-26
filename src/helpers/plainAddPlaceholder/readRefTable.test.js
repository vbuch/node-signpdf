import fs from 'fs';
import readRefTable from './readRefTable';

describe('readRefTable', () => {
    it('Expects to merge correctly the refTable of resources', () => {
        [
            'signed-once.pdf',
            'signed-twice.pdf',
            'contributing.pdf',
            'formexample.pdf',
            'incrementally_signed.pdf',
            'signed.pdf',
            'w3dummy.pdf',
        ].forEach((fileName) => {
            const pdf = fs.readFileSync(`${__dirname}/../../../resources/${fileName}`);
            const r = readRefTable(pdf);
            expect(r).toMatchSnapshot();
        });
    });
});
