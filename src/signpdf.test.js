import signpdf from './signpdf';

describe('Test pdfsign', () => {
    it('expects PDF to be Buffer', () => {
        expect(() => {
            signpdf('non-buffer', Buffer.from(''));
        }).toThrow();
    });
    it('expects P12 certificate to be Buffer', () => {
        expect(() => {
            signpdf(Buffer.from(''), 'non-buffer');
        }).toThrow();
    });
    it('signs input PDF', () => {
        console.log('it does not yet sign...');
    });
});
