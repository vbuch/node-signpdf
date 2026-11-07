const js = require('@eslint/js');
const globals = require('globals');
const sharedConfig = require('@signpdf/eslint-config');

const packageFiles = [
    'packages/placeholder-pdf-lib/**/*.js',
    'packages/placeholder-pdfkit/**/*.js',
    'packages/placeholder-pdfkit010/**/*.js',
    'packages/placeholder-plain/**/*.js',
    'packages/signer-p12/**/*.js',
    'packages/signpdf/**/*.js',
    'packages/utils/**/*.js',
];

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            '**/coverage/**',
            '**/dist/**',
            '**/jest.config.js',
            '**/.*',
        ],
    },
    {
        ...sharedConfig,
        files: packageFiles,
    },
    {
        name: 'signpdf/examples',
        files: ['packages/examples/**/*.js'],
        languageOptions: {
            ecmaVersion: 2019,
            sourceType: 'commonjs',
            globals: globals.node,
        },
        rules: js.configs.recommended.rules,
    },
];
