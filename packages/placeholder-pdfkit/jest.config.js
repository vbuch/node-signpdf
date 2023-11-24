const sharedConfig = require('../../jest.config.base');
module.exports = {
    ...sharedConfig,
    coveragePathIgnorePatterns: [
        ...sharedConfig.coveragePathIgnorePatterns,
        '/src/pdfkit/',
    ],
    coverageThreshold: {
        ...sharedConfig.coverageThreshold,
        '**/pdfkitAddPlaceholder.js': {
            functions: 100,
            lines: 96.77,
            statements: 96.77,
            branches: 88.88,
        }
    }
};