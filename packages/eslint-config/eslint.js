import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import {defineConfig} from 'eslint/config';
import {importX, createNodeResolver} from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default defineConfig([
    {
        name: '@signpdf/eslint-config/javascript',
        extends: [
            js.configs.recommended,
            stylistic.configs.customize({
                indent: 4,
                quotes: 'single',
                semi: true,
                jsx: false,
                arrowParens: true,
                braceStyle: '1tbs',
            }),
            importX.flatConfigs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        settings: {
            'import-x/resolver-next': [createNodeResolver({
                extensions: ['.mjs', '.js', '.json'],
            })],
        },
        rules: {
            curly: ['error', 'all'],
            '@stylistic/brace-style': ['error', '1tbs', {allowSingleLine: false}],
            '@stylistic/object-curly-spacing': ['error', 'never'],
            'import-x/no-extraneous-dependencies': ['error', {
                devDependencies: ['**/*.test.js', '**/__mocks__/*'],
            }],
        },
    },
    {
        name: '@signpdf/eslint-config/tests',
        files: ['**/*.test.js'],
        extends: [jest.configs['flat/recommended']],
        rules: {
            'jest/no-conditional-expect': 'off',
            'jest/valid-title': ['error', {ignoreTypeOfDescribeName: true}],
        },
    },
]);
