/**
 * @typedef {object} ReturnType
 * @prop {Promise<Buffer>} promise
 * @prop {PDFDocument} pdf
 */

/**
 * Creates a Buffer containing a PDF.
 * Returns a Promise that is resolved with the resulting Buffer of the PDFDocument.
 * @returns {ReturnType}
 */
module.exports = function (PDFDocument, params = {}) {
    var requestParams = {
        placeholder: {
            contactInfo: 'testemail@example.com',
            name: 'test name',
            location: 'test Location',
        },
        text: 'node-signpdf',
        pages: 1,
        layout: 'portrait',
        end: true,
    };
    Object.assign(requestParams, params);
    if (requestParams.pages < 1) {
        requestParams.pages = 1;
    }

    var pdf = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        layout: requestParams.layout,
        bufferPages: true,
    });;
    pdf.info.CreationDate = '';

    // Add some content to the page(s)
    for (var i = 0; i < requestParams.pages; i += 1) {
        pdf
            .addPage()
            .fillColor('#333')
            .fontSize(25)
            .moveDown()
            .text(requestParams.text)
            .save();
    }

    var ended = new Promise(function (resolve) {
        // Collect the ouput PDF
        // and, when done, resolve with it stored in a Buffer
        var pdfChunks = [];
        pdf.on('data', function (data) {
            pdfChunks.push(data);
        });
        pdf.on('end', function () {
            resolve(Buffer.concat(pdfChunks));
        });
    })

    return {
        ended: ended,
        pdf: pdf,
    }
};
