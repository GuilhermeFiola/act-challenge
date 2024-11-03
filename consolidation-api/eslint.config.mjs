import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}']
    },
    {
        languageOptions: {
            globals: globals.browser
        }
    },
    {
        ignores: ['node_modules/*', 'dist/*', 'jest.config.js']
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            eqeqeq: 'off',
            'no-unused-vars': 'off',
            'prefer-const': ['error'],
            'semi': [2, 'never'],
            'quotes': [2, 'single', { 'avoidEscape': true }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
        },
    }
]