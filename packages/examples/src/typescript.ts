import fs from 'fs';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import signer from '@signpdf/signpdf'

function work() {
    // contributing.pdf is the file that is going to be signed
    const pdfBuffer = fs.readFileSync(`${__dirname}/../../../resources/contributing.pdf`);
    // certificate.p12 is the certificate that is going to be used to sign
    const certificateBuffer = fs.readFileSync(`${__dirname}/../../../resources/certificate.p12`);

    // The PDF needs to have a placeholder for a signature to be signed.
    const pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer,
        reason: 'The user is decalaring consent.',
        contactInfo: 'signpdf@example.com',
        name: 'John Doe',
        location: 'Free Text Str., Free World',
    });

    // pdfWithPlaceholder is now a modified buffer that is ready to be signed.
    const signedPdf = signer.sign(pdfWithPlaceholder, certificateBuffer);

    // signedPdf is a Buffer of an electronically signed PDF. Store it.
    const targetPath = `${__dirname}/../output/typescript.pdf`;
    fs.writeFileSync(targetPath, signedPdf);
}

work();