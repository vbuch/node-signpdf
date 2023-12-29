var fs = require('fs');
var path = require('path');
var PDFDocument = require('pdf-lib').PDFDocument;
var pdflibAddPlaceholder = require('@signpdf/placeholder-pdf-lib').pdflibAddPlaceholder;
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

    // Load the document into PDF-LIB
    PDFDocument.load(pdfBuffer).then(function (pdfDoc) {
        // Add a placeholder for a signature.
        pdflibAddPlaceholder({
            pdfDoc: pdfDoc,
            reason: 'The user is declaring consent through JavaScript.',
            contactInfo: 'signpdf@example.com',
            name: 'John Doe',
            location: 'Free Text Str., Free World',
        });

        // Get the modified PDFDocument bytes
        pdfDoc.save().then(function (pdfWithPlaceholderBytes) {
            // And finally sign the document.
            signpdf
                .sign(pdfWithPlaceholderBytes, signer)
                .then(function (signedPdf) {
                    // signedPdf is a Buffer of an electronically signed PDF. Store it.
                    var targetPath = path.join(__dirname, '/../output/pdf-lib.pdf');
                    fs.writeFileSync(targetPath, signedPdf);
                })
        })
    })
}

work();