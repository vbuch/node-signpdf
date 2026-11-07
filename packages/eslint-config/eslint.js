const globals = require('globals');
const {importX, createNodeResolver} = require('eslint-plugin-import-x');
const jest = require('eslint-plugin-jest');
const baseRules = require('./base-rules');

const jestRecommended = jest.configs['flat/recommended'];

module.exports = {
    name: '@signpdf/eslint-config',
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
            ...globals.node,
            ...jestRecommended.languageOptions.globals,
        },
    },
    plugins: {
        'import-x': importX,
        jest,
    },
    rules: {
        ...baseRules,
        ...jestRecommended.rules,
        indent: ['error', 4, {SwitchCase: 1}],
        'object-curly-spacing': ['error', 'never'],
        'import-x/no-extraneous-dependencies': ['error', {
            devDependencies: ['**/*.test.js', '**/__mocks__/*'],
        }],
        'func-names': ['warn', 'never'],
        'no-throw-literal': 'off',
        'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always',
        }],
        radix: ['error', 'as-needed'],
        'class-methods-use-this': 'off',
        'jest/no-conditional-expect': 'off',
        'import-x/prefer-default-export': 'off',
        'no-bitwise': 'off',
        'jest/valid-title': ['error', {ignoreTypeOfDescribeName: true}],
        // Preserve the ESLint 8 defaults when moving the shared rules to ESLint 9.
        'no-constant-condition': ['warn', {checkLoops: true}],
        'no-inner-declarations': ['error', 'functions', {blockScopedFunctions: 'disallow'}],
        'no-unused-vars': ['error', {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true,
            caughtErrors: 'none',
        }],
        'no-useless-computed-key': ['error', {enforceForClassMembers: false}],
    },
    settings: {
        'import-x/resolver-next': [createNodeResolver({
            extensions: ['.mjs', '.js', '.json'],
        })],
        'import-x/extensions': ['.js', '.mjs', '.jsx'],
        'import-x/core-modules': [],
        'import-x/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg|json)$'],
    },
};
