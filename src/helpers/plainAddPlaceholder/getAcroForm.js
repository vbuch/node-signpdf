import PDFKitReferenceMock from '../pdfkitReferenceMock';

const getAcroForm = (pdfBuffer) => {
    const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm');
    const isAcroFormExists = acroFormPosition > -1;
    const data = {
        Fields: [],
        DR: {
            Font: {},
        },
    };
    let fieldIds = [];
    let acroFormId;

    if (isAcroFormExists) {
        let acroFormStart = acroFormPosition;
        // 10 is the distance between "/Type /AcroForm" and AcroFrom ID
        const charsUntilIdEnd = 10;
        const acroFormIdEnd = acroFormPosition - charsUntilIdEnd;
        // Let's find AcroForm ID by trying to find the "\n" before the ID
        // 12 is a enough space to find the "\n" (generally it's 2 or 3, but I'm giving a big space though)
        const maxAcroFormIdLength = 12;
        let foundAcroFormId = '';
        for (let i = charsUntilIdEnd + 1; i < charsUntilIdEnd + maxAcroFormIdLength; i += 1) {
            const acroFormIdString = pdfBuffer.slice(acroFormPosition - i, acroFormIdEnd).toString();

            if (acroFormIdString[0] === '\n') {
                break;
            }

            foundAcroFormId = acroFormIdString;
            acroFormStart = acroFormPosition - i;
        }

        const pdfSlice = pdfBuffer.slice(acroFormStart);
        const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString();
        acroFormId = parseInt(foundAcroFormId);

        const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'));
        fieldIds = acroFormFields
            .split(' ')
            .filter((element, index) => index % 3 === 0)
            .map(fieldId => new PDFKitReferenceMock(fieldId, {id: fieldId}));
        data.Fields = fieldIds;
        return new PDFKitReferenceMock(acroFormId, data);
    }
};

export default getAcroForm;
