import fs from 'fs';
import readRefTable, { getFullXrefTable, getLastTrailerPosition } from './readRefTable';

// describe('getLastTrailerPosition', () => {
//     it('sucessfully gets position from resources', () => {
//         const output = new Map();
//         [
//             'issue-github-a5-a4.pdf',
//         ].forEach((fileName) => {
//             const pdf = fs.readFileSync(`${__dirname}/../../../resources/${fileName}`);
//             const position = getLastTrailerPosition(pdf);
//             output.set(fileName, position);
//         })
//         expect(output).toMatchSnapshot();
//     })
// });
// describe('getFullXrefTable', () => {
//     it('sucessfully reads the refTable of resources', () => {
//         [
//             'issue-github-a5-a4.pdf',
//         ].forEach((fileName) => {
//             const pdf = fs.readFileSync(`${__dirname}/../../../resources/${fileName}`);
//             const r = getFullXrefTable(pdf);
//         })
//     })
// });
describe('readRefTable', () => {
    // it('sucessfully reads the refTable of resources', () => {
    //     [
    //         'issue-github-a5-a4.pdf',
    //     ].forEach((fileName) => {
    //         const pdf = fs.readFileSync(`${__dirname}/../../../resources/${fileName}`);
    //         const r = readRefTable(pdf);
    //         console.log(r)
    //         // expect(r).toMatchSnapshot();
    //     });
    // });
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
