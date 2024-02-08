module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    parserOptions: {
        sourceType: 'module',
    },

    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            plugins: ['import'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:jest/recommended',
                'plugin:import/typescript',
                'plugin:prettier/recommended',
            ],
            rules: {
                'import/order': [
                    'error',
                    {
                        alphabetize: {
                            order: 'asc',
                            caseInsensitive: true,
                        },
                        'newlines-between': 'always',
                    },
                ],
            },
        },
        {
            files: ['*.js'],
            extends: ['eslint:recommended', 'plugin:prettier/recommended'],
            rules: {
                'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            },
        },
    ],
    rules: {
        quotes: 'off',
    },
};
