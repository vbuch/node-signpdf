const sharedConfig = require('../../jest.config.base');
module.exports = {
    ...sharedConfig,
    coveragePathIgnorePatterns: [
        ...sharedConfig.coveragePathIgnorePatterns,
        '/src/pdfkit/',
    ],
};
