var fs = require('fs');
var path = require('path');
var PDFDocument = require('pdfkit');
var signpdf = require('@signpdf/signpdf').default;
var P12Signer = require('@signpdf/signer-p12').P12Signer;
var pdfkitAddPlaceholder = require('@signpdf/placeholder-pdfkit010').pdfkitAddPlaceholder;

function work() {
    // Start a PDFKit document
    var pdf = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        layout: 'portrait',
        bufferPages: true,
    });
    pdf.info.CreationDate = '';

    // At the end we want to convert the PDFKit to a string/Buffer and store it in a file.
    // Here is how this is going to happen:
    var pdfReady = new Promise(function (resolve) {
        // Collect the ouput PDF
        // and, when done, resolve with it stored in a Buffer
        var pdfChunks = [];
        pdf.on('data', function (data) {
            pdfChunks.push(data);
        });
        pdf.on('end', function () {
            resolve(Buffer.concat(pdfChunks));
        });
    });

    // Add some content to the page(s)
    pdf
        .addPage()
        .fillColor('#333')
        .fontSize(25)
        .moveDown()
        .text('@signpdf')
        .save();

    // Here comes the signing. We need to add the placeholder so that we can later sign.
    var refs = pdfkitAddPlaceholder({
        pdf: pdf,
        pdfBuffer: Buffer.from([pdf]), // FIXME: This shouldn't be needed.
        reason: 'Showing off.',
        contactInfo: 'signpdf@example.com',
        name: 'Sign PDF',
        location: 'The digital world.',
    });
    // `refs` here contains PDFReference objects to signature, form and widget.
    // PDFKit doesn't know much about them, so it won't .end() them. We need to do that for it.
    Object.keys(refs).forEach(function (key) {
        refs[key].end()
    });

    // Once we .end the PDFDocument, the `pdfReady` Promise will resolve with
    // the Buffer of a PDF that has a placeholder for signature that we need.
    // Other that we will also need a certificate
    // certificate.p12 is the certificate that is going to be used to sign
    var certificatePath = path.join(__dirname, '/../../../resources/certificate.p12');
    var certificateBuffer = fs.readFileSync(certificatePath);
    var signer = new P12Signer(certificateBuffer);
    
    // Once the PDF is ready we need to sign it and eventually store it on disc.
    pdfReady
        .then(function (pdfWithPlaceholder) {
            return signpdf.sign(pdfWithPlaceholder, signer);
        })
        .then(function (signedPdf) {
            var targetPath = path.join(__dirname, '/../output/pdfkit010.pdf');
            fs.writeFileSync(targetPath, signedPdf);
        });

    // Finally end the PDFDocument stream.
    pdf.end();
    // This has just triggered the `pdfReady` Promise to be resolved.
}

work();