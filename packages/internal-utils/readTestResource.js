var fs = require('fs');

module.exports = function (filename) {
    if (filename === '.' || (/(\/|\\|\.\.)/).test(filename)) {
        throw new Error(`"${filename}" is invalid filename.`);
    }
    return fs.readFileSync(`${__dirname}/../../resources/${filename}`);
};