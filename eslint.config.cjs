const js = require('@eslint/js');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
    {
        ignores: ['dist/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        rules: {
            'no-undef': 'off',
            'no-useless-assignment': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
        },
        rules: {
            ...typescriptPlugin.configs.recommended.rules,
            'no-undef': 'off',
            'no-useless-assignment': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            quotes: ['warn', 'single'],
            indent: ['warn', 4, { SwitchCase: 1 }],
            semi: ['warn', 'always'],
            'comma-dangle': ['warn', 'always-multiline'],
            'dot-notation': 'warn',
            eqeqeq: 'warn',
            curly: ['warn', 'all'],
            'brace-style': 'warn',
            'prefer-arrow-callback': 'warn',
            'max-len': ['warn', 180],
            'no-console': 'warn',
            'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
];
