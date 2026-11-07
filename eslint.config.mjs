import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import sharedConfig from '@signpdf/eslint-config';

const packageFiles = [
    'packages/placeholder-pdf-lib/**/*.js',
    'packages/placeholder-pdfkit/**/*.js',
    'packages/placeholder-pdfkit010/**/*.js',
    'packages/placeholder-plain/**/*.js',
    'packages/signer-p12/**/*.js',
    'packages/signpdf/**/*.js',
    'packages/utils/**/*.js',
];

export default defineConfig([
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
        files: packageFiles,
        extends: [sharedConfig],
    },
    {
        name: 'signpdf/examples',
        files: ['packages/examples/**/*.js'],
        extends: [js.configs.recommended],
        languageOptions: {
            ecmaVersion: 2019,
            sourceType: 'commonjs',
            globals: globals.node,
        },
    },
]);
