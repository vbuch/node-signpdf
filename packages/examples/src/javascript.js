var fs = require('fs');
var path = require('path');
var plainAddPlaceholder = require('@signpdf/placeholder-plain').plainAddPlaceholder;
var signpdf = require('@signpdf/signpdf').default;
var P12Signer = require('@signpdf/signer-p12').P12Signer;

function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, '/../../../resources/contributing.pdf');
    var pdfBuffer = fs.readFileSync(sourcePath);
    
    // certificate.p12 is the certificate that is going to be used to sign
    var certificatePath = path.join(__dirname, '/../../../resources/certificate.p12');
    var certificateBuffer = fs.readFileSync(certificatePath);
    var signer = new P12Signer(certificateBuffer);

    // The PDF needs to have a placeholder for a signature to be signed.
    var pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer: pdfBuffer,
        reason: 'The user is decalaring consent through JavaScript.',
        contactInfo: 'signpdf@example.com',
        name: 'John Doe',
        location: 'Free Text Str., Free World',
    });

    // pdfWithPlaceholder is now a modified buffer that is ready to be signed.
    signpdf
        .sign(pdfWithPlaceholder, signer)
        .then(function (signedPdf) {
            // signedPdf is a Buffer of an electronically signed PDF. Store it.
            var targetPath = path.join(__dirname, '/../output/javascript.pdf');
            fs.writeFileSync(targetPath, signedPdf);
        })
}

work();