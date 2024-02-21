var fs = require('fs');
var path = require('path');
var plainAddPlaceholder = require('@signpdf/placeholder-plain').plainAddPlaceholder;
var signpdf = require('@signpdf/signpdf').default;
var P12Signer = require('@signpdf/signer-p12').P12Signer;

function buyerSign(pdfBuffer, targetPath) {
    // Add a placeholder for John Doe - the customer
    var pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer: pdfBuffer,
        reason: 'Agrees to buy the truck trailer.',
        contactInfo: 'john@example.com',
        name: 'John Doe',
        location: 'Free Text Str., Free World',
    });

    // John signs the PDF
    // certificate.p12 is the certificate that is going to be used to sign
    var certificateBuffer = fs.readFileSync(path.join(__dirname, '/../../../resources/certificate.p12'));
    var signer = new P12Signer(certificateBuffer);
    return signpdf
        .sign(pdfWithPlaceholder, signer)
        .then(function (signedPdf) {
            // signedPdf is a Buffer of an electronically signed PDF. Store it.
            fs.writeFileSync(targetPath, signedPdf);

            return signedPdf;
        })
}

function sellerSign(pdfBuffer, targetPath) {
    // Add a placeholder for John Doe - the customer
    var pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer: pdfBuffer,
        reason: 'Agrees to sell a truck trailer to John Doe.',
        contactInfo: 'dealer@example.com',
        name: 'Thug Dealer',
        location: 'Automotive Str., Free World',
    });

    // The seller signs the PDF
    // bundle.p12 is the certificate bundle that is going to be used to sign
    var certificateBuffer = fs.readFileSync(path.join(__dirname, '/../../../resources/bundle.p12'));
    var signer = new P12Signer(certificateBuffer);
    return signpdf
        .sign(pdfWithPlaceholder, signer)
        .then(function (signedPdf) {
            // signedPdf is a Buffer of an electronically signed PDF. Store it.
            fs.writeFileSync(targetPath, signedPdf);

            return signedPdf;
        })
}

/**
 * John Doe is buying a truck trailer from Thug Dealer.
 * The PDF is signed by both parties in two copies.
 * The first copy is signed by John Doe and then by Thug Dealer.
 * The second copy is signed by Thug Dealer and then by John Doe.
 * 4 PDFs are created in the output folder.
 */
function work() {
    // contributing.pdf is the "contract" they are going to sign.
    var pdfBuffer = fs.readFileSync(path.join(__dirname, '/../../../resources/contributing.pdf'));

    // A copy of the PDF is signed by the buyer and then by the seller.
    buyerSign(
        pdfBuffer,
        path.join(__dirname, '/../output/multiple-signatures-buyer-seller-1.pdf'
    ))
        .then(function (signedByCustomer) {
            return sellerSign(
                signedByCustomer,
                path.join(__dirname, '/../output/multiple-signatures-buyer-seller-2.pdf')
            );
        });

    // A copy of the PDF is signed by the seller and then by the buyer.
    sellerSign(
        pdfBuffer,
        path.join(__dirname, '/../output/multiple-signatures-seller-buyer-1.pdf'
    ))
        .then(function (signedBySeller) {
            return buyerSign(
                signedBySeller,
                path.join(__dirname, '/../output/multiple-signatures-seller-buyer-2.pdf')
            );
        });
}

work();