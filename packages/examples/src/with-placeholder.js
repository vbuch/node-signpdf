var fs = require('fs');
var path = require('path');
var signer = require('@signpdf/signpdf').default;

function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, '/../../../resources/with-placeholder.pdf');
    var pdfWithPlaceholder = fs.readFileSync(sourcePath);
    
    // certificate.p12 is the certificate that is going to be used to sign
    var certificatePath = path.join(__dirname, '/../../../resources/certificate.p12');
    var certificateBuffer = fs.readFileSync(certificatePath);

    // pdfWithPlaceholder is a Buffer that is ready to be signed.
    var signedPdf = signer.sign(pdfWithPlaceholder, certificateBuffer);

    // signedPdf is a Buffer of an electronically signed PDF. Store it.
    var targetPath = path.join(__dirname, '/../output/with-placeholder.pdf');
    fs.writeFileSync(targetPath, signedPdf);
}

work();