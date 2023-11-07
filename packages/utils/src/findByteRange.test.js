import {readTestResource} from '@signpdf/internal-utils';
import {findByteRange} from './findByteRange';
import {SignPdfError} from './SignPdfError';

describe(findByteRange, () => {
    it('expects PDF to be Buffer', () => {
        try {
            findByteRange('non-buffer');
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_INPUT);
        }
    });
    it('expects no byteRangePlaceholder but byteRangeStrings when PDF is already signed', async () => {
        const pdfBuffer = readTestResource('signed.pdf');

        const {
            byteRangePlaceholder,
            byteRangePlaceholderPosition,
            byteRangeStrings,
        } = findByteRange(pdfBuffer);

        expect(byteRangePlaceholder).toBe(undefined);
        expect(byteRangePlaceholderPosition).toBe(undefined);
        expect(byteRangeStrings[0]).toBe('/ByteRange [0 153 3379 1275]');
    });
    it('throws an error when multiple placeholder ranges are found', async () => {
        const pdfBuffer = Buffer.from(`
            /This (Is not an actual PDF)
            /But (findByteRange shouldn't care)
            /ByteRange [0 153 3379 1275]
            /ByteRange [0 /********** /********** /**********]
            /ByteRange [0   /**********  /********** /**********]
            /ByteRange   [ 0 /AAA /AAA /AAA ]
        `);

        expect(() => {
            findByteRange(pdfBuffer);
        }).toThrowErrorMatchingInlineSnapshot('"Found multiple ByteRange placeholders."');
    });
    it('matches all byte ranges and recognizes the placeholder one', async () => {
        const pdfBuffer = Buffer.from(`
            /This (Is not an actual PDF)
            /But (findByteRange shouldn't care)
            /ByteRange [0 153 3379 1275]
            /ByteRange [0 /********** /********** /**********]
            /ByteRange   [ 0 /AAA /AAA /AAA ]
        `);

        const {byteRangePlaceholder, byteRangePlaceholderPosition, byteRangeStrings} = findByteRange(pdfBuffer, 'AAA');

        expect(byteRangePlaceholder).toBe('/ByteRange   [ 0 /AAA /AAA /AAA ]');
        expect(byteRangePlaceholderPosition).toBe(206);
        expect(byteRangeStrings).toEqual(expect.arrayContaining([
            '/ByteRange [0 153 3379 1275]',
            '/ByteRange [0 /********** /********** /**********]',
            '/ByteRange   [ 0 /AAA /AAA /AAA ]',
        ]));
    });

    const specs = [
        {
            label: 'with omitted placeholder',
            asString: '/ByteRange [0 /********** /********** /**********]',
            match: '/ByteRange [0 /********** /********** /**********]',
            byteRange: ['0', '/**********', '/**********', '/**********'],
            // placeholder: optional,
        },
        {
            label: 'with passed placeholder',
            asString: '/ByteRange [0 /********** /********** /**********]',
            match: '/ByteRange [0 /********** /********** /**********]',
            byteRange: ['0', '/**********', '/**********', '/**********'],
            placeholder: '**********',
        },
        {
            label: 'ignoring spaces',
            asString: '/ByteRange      [0   /**********  /**********           /**********]',
            match: '/ByteRange      [0   /**********  /**********           /**********]',
            byteRange: ['0', '/**********', '/**********', '/**********'],
            placeholder: '**********',
        },
        {
            label: 'with a different placeholder',
            asString: '/ByteRange [ 0 /AAA /AAA /AAA ]',
            match: '/ByteRange [ 0 /AAA /AAA /AAA ]',
            byteRange: ['0', '/AAA', '/AAA', '/AAA'],
            placeholder: 'AAA',
        },
        {
            label: 'not just a placeholder',
            asString: '/ByteRange [ 0 123 456 789 ]',
            match: undefined,
            byteRange: ['0', '123', '456', '789'],
            placeholder: 'AAA',
        },
    ];
    it.each(specs)(
        'expects to return correct byteRangeString and byteRange - $label',
        ({
            byteRange, asString, placeholder, match,
        }) => {
            const pdfBuffer = Buffer.from(`
                /This /Looks
                /Like /A
                /PDF /But
                /Is /Not
                ${asString}
                /But (findByteRange shouldn't care)
            `);

            const {byteRangePlaceholder, byteRanges} = findByteRange(pdfBuffer, placeholder);

            expect(byteRangePlaceholder).toBe(match);
            expect(byteRanges[0]).toEqual(byteRange);
        },
    );
});
