module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["airbnb-base"],
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: [],
    globals: {
        axios: 'readonly', // Axios as a read-only global variable
    },
    ignorePatterns: ["node_modules/*", ".env"],
    overrides: [
        {
            files: ["**/*.js"],
            rules: {
                'func-names': 'off',
                'prefer-arrow-callback': 'off',
                // 'no-console': 'error',
                'no-unused-vars': 'off',
                'no-restricted-globals': 'off',
                'no-param-reassign': [2, {
                    "props": false
                }],
                'no-plusplus': 'off', // Disable the no-plusplus rule, allow i++
                'max-len': ['error', { code: 300}], //Some functions are too long
            },
        },
    ],
};
