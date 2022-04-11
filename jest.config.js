module.exports = {
    verbose: false,
    testEnvironment: 'node',
    moduleFileExtensions: [
        'js',
        'json',
        'node',
    ],
    testRegex: '(/__tests__/.*|\\.test)\\.js$',
    testPathIgnorePatterns: [
        'node_modules',
        'dist',
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/helpers/pdfkit/',
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
