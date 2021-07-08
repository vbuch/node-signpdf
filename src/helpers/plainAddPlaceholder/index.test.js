import fs from 'fs';
import plainAddPlaceholder from './index';

describe('plainAddPlaceholder', () => {
    it('adds placeholder to a prepared document', () => {
        const input = fs.readFileSync(`${__dirname}/../../../resources/w3dummy.pdf`);
        expect(input.indexOf('/ByteRange')).toBe(-1);
        const output = plainAddPlaceholder({
            pdfBuffer: input,
            reason: 'Because I can',
            location: 'some place',
            name: 'example name',
            contactInfo: 'emailfromp1289@gmail.com',
        });
        expect(output).toBeInstanceOf(Buffer);
        expect(output.indexOf('/ByteRange')).not.toBe(-1);
    });

    // TODO: This is quite limited testing. Need more.
});
