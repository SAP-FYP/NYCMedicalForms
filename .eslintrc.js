module.exports = {
    env: {
        browser: false,
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["airbnb-base"],
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: [],
    ignorePatterns: ["node_modules/*", ".env"],
    overrides: [
        {
            files: ["**/*.js"],
            rules: {
                'func-names': 'off',
                'prefer-arrow-callback': 'off',
                'no-console': 'error',
                'no-unused-vars': 'off',
                'no-restricted-globals': 'off',
                'no-param-reassign': [2, {
                    "props": false
                }]
            },
        },
    ],
};
