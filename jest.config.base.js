module.exports = {
    verbose: false,
    testRegex: '(/__tests__/.*|\\.test)\\.js$',
    testEnvironment: 'node',
    transform: {
        '\\.js$': ['babel-jest', {rootMode: 'upward'}],
    },
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
