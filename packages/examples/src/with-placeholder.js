var fs = require('fs');
var path = require('path');
var signpdf = require('@signpdf/signpdf').default;
var P12Signer = require('@signpdf/signer-p12').P12Signer;

function work() {
    // contributing.pdf is the file that is going to be signed
    var sourcePath = path.join(__dirname, '/../../../resources/with-placeholder.pdf');
    var pdfWithPlaceholder = fs.readFileSync(sourcePath);
    
    // certificate.p12 is the certificate that is going to be used to sign
    var certificatePath = path.join(__dirname, '/../../../resources/certificate.p12');
    var certificateBuffer = fs.readFileSync(certificatePath);
    var signer = new P12Signer(certificateBuffer);

    // pdfWithPlaceholder is a Buffer that is ready to be signed.
    signpdf.sign(pdfWithPlaceholder, signer)
        .then(function (signedPdf) {
            // signedPdf is a Buffer of an electronically signed PDF. Store it.
            var targetPath = path.join(__dirname, '/../output/with-placeholder.pdf');
            fs.writeFileSync(targetPath, signedPdf);
        });

}

work();