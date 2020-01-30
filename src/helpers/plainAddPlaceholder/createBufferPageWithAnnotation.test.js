import createBufferPageWithAnnotation from './createBufferPageWithAnnotation';
import findObject from './findObject';
import SignPdfError from '../../SignPdfError';

jest.mock('./findObject', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('createBufferPageWithAnnotation', () => {
    it('Reports unsupported feature', () => {
        findObject.mockImplementation(() => {
            console.log('aham');
            return '/Annots [1 0 R]'
        });
        const info = {xref: {}};
        info.xref.offsets = new Map();
        info.xref.offsets.set(1, 1);
        const buffer = createBufferPageWithAnnotation('pdf', info, '1 0 R', '2 0 R');
        console.log(buffer.toString());
        expect(true).toBe(false);
    });
});
