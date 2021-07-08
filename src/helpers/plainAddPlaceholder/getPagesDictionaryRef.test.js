import getPagesDictionaryRef from './getPagesDictionaryRef';
import SignPdfError from '../../SignPdfError';

describe('getPagesDictionaryRef', () => {
    it('Errors when pages descriptor is not found', () => {
        const info = {
            root: '/Catalog',
        };

        try {
            getPagesDictionaryRef(info);
            expect('here').not.toBe('here');
        } catch (e) {
            expect(e instanceof SignPdfError).toBe(true);
            expect(e.type).toBe(SignPdfError.TYPE_PARSE);
            expect(e.message).toMatchSnapshot();
        }
    });

    it('getPagesDictionaryRef gets pages descriptor', () => {
        const info = {
            root: '/Type /Catalog\n/Pages 14 0 R',
        };

        const pagesRef = getPagesDictionaryRef(info);
        expect(pagesRef).toBe('14 0 R');
    });

    it('getPagesDictionaryRef gets pages descriptor when info root is in another order', () => {
        const info = {
            root: '/Pages 2 0 R /Type/Catalog/ViewerPreferences<</DisplayDocTitle true/HideMenubar true/HideToolbar true/HideWindowUI true>>',
        };

        const pagesRef = getPagesDictionaryRef(info);
        expect(pagesRef).toBe('2 0 R');
    });
});
