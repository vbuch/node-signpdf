import SignPdfError from '../../SignPdfError';
import xrefToRefMap from './xrefToRefMap';

const xrefStrings = [
    `0 39
0000000000 65535 f 
0000100423 00000 n 
0000100501 00000 n 
0000100361 00000 n 
0000100340 00000 n 
0000061908 00000 n 
0000061783 00000 n 
0000061679 00000 n 
0000099156 00000 n 
0000121651 00000 n 
0000000015 00000 n 
0000062401 00000 n 
0000062300 00000 n 
0000062193 00000 n 
0000097854 00000 n 
0000064460 00000 n 
0000064370 00000 n 
0000064263 00000 n 
0000097049 00000 n 
0000096948 00000 n 
0000096824 00000 n 
0000096650 00000 n 
0000096706 00000 n 
0000100195 00000 n 
0000097749 00000 n 
0000097600 00000 n 
0000097625 00000 n 
0000097650 00000 n 
0000097686 00000 n 
0000097718 00000 n 
0000100548 00000 n 
0000097952 00000 n 
0000098210 00000 n 
0000098776 00000 n 
0000113292 00000 n 
0000099303 00000 n 
0000099567 00000 n 
0000099874 00000 n 
0000115410 00000 n `,
    `0 1
0000000000 65535 f
6 2
0000662716 00000 n
0000662578 00000 n
39 35
0000655893 00000 n
0000656101 00000 n
0000656080 00000 n
0000656127 00000 n
0000656181 00000 n
0000656389 00000 n
0000656368 00000 n
0000656415 00000 n
0000656469 00000 n
0000656794 00000 n
0000656771 00000 n
0000672037 00000 n
0000656877 00000 n
0000657136 00000 n
0000657114 00000 n
0000661923 00000 n
0000657252 00000 n
0000659653 00000 n
0000659629 00000 n
0000661899 00000 n
0000662162 00000 n
0000662140 00000 n
0000662250 00000 n
0000662498 00000 n
0000662476 00000 n
0000663052 00000 n
0000662932 00000 n
0000663030 00000 n
0000663185 00000 n
0000663207 00000 n
0000672013 00000 n
0000672535 00000 n
0000672943 00000 n
0000672920 00000 n
0000673269 00000 n`,
];

describe('xrefToRefMap', () => {
    it('Predefined xrefs match their snapshots', () => {
        xrefStrings.forEach((xref) => {
            expect(xrefToRefMap(xref)).toMatchSnapshot();
        });
    });
    it('Throws an error when number of items does not match statement', () => {
        try {
            xrefToRefMap(`0 1
000 000 f
001 000 n
002 100 n`);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
        }
    });
    it('Throws an error when unknown in-use flag is uses', () => {
        try {
            xrefToRefMap(`0 3
000 000 f
001 000 n
002 100 w`);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
    it('Throws an error when non-integer offset is given', () => {
        try {
            xrefToRefMap(`0 3
000 000 f
001 000 n
20a 100 n`);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });
});
