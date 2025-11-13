import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const reactHooks = require('eslint-plugin-react-hooks');

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: {
            js,
            'simple-import-sort': simpleImportSort,
            import: importPlugin,
            prettier: prettierPlugin,
            'react-hooks': reactHooks,
            react: reactPlugin,
        },
        extends: [js.configs.recommended],
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                alias: {
                    map: [
                        ['@/users/*', './src/units/users/*'],
                        ['@/shared/*', './src/shared/*'],
                        ['@/typings/*', './src/typings/*'],
                        ['@/test/*', './src/__test__/*'],
                        ['@/utils/*', './src/utils/*'],
                        ['@/locales/*', './src/locales/*'],
                        ['@/todos/*', './src/units/todos'],
                    ],
                    extensions: ['.ts', '.tsx', '.js', '.jsx'],
                },
            },
        },
        languageOptions: {
            globals: {...globals.browser, ...globals.node, ...globals.jest},
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    reactPlugin.configs.flat.recommended,
    {
        rules: {
            '@typescript-eslint/only-throw-error': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            'react/display-name': 'off',
            'react/jsx-key': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            'prefer-const': 'error',
            'no-console': 'warn',
            'simple-import-sort/imports': 'off',
            'simple-import-sort/exports': 'off',
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['internal'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
    {
        files: ['**/*.{jsx,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-key': 'error',
            'react/jsx-no-duplicate-props': 'error',
            '@/object-curly-spacing': ['warn', 'never'],
        },
    },
    {
        files: ['**/webpack.config.js', '**/*.config.*', '**/scripts/**'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['**/locales/*.json'],
        rules: {
            'i18n-json/valid-message-syntax': 'error',
            'i18n-json/valid-json': 'error',
        },
    },
    {
        files: ['**/__test__/mocks/**', '**/__test__/utils/**'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
]);
