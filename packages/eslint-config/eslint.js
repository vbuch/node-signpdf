module.exports = {
    extends: [
        "airbnb-base",
        "plugin:jest/recommended"
    ],
    env: {
        "es6": true,
        "node": true,
        "jest": true
    },
    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false
    },
    plugins: [
        "jest"
    ],
    rules: {
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "object-curly-spacing": ["error", "never"],
        "import/no-extraneous-dependencies": ["error", { "devDependencies": ["**/*.test.js", "**/__mocks__/*"] }],
        "func-names": ["warn", "never"],
        "no-throw-literal": "off",
        "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
        "space-before-function-paren": ["error", { "anonymous": "never", "named": "never", "asyncArrow": "always" }],
        "radix": ["error", "as-needed"],
        "class-methods-use-this": "off",
        "jest/no-conditional-expect": "off",
        "import/prefer-default-export": "off",
        "no-bitwise": "off",
        "jest/valid-title": ["error", {"ignoreTypeOfDescribeName": true}]
    },
    settings: {
        "import/resolver": {
            "babel-module": {}
        }
    }
}