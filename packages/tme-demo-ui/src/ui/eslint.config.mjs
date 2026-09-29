import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import globals from 'globals';
import promise from 'eslint-plugin-promise';

export default [
  {
    ignores: [
      'node_modules/**'
    ]
  },
  js.configs.recommended,
  promise.configs['flat/recommended'],
  eslintReact.configs.jsx,
  eslintReact.configs.dom,
  {
    files: [ '**/*.{js,jsx}' ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es6
      }
    },
    settings: {
      ecmascript: 6,
      jsx: true
    },
    rules: {
      camelcase: 'off',
      'jsx-quotes': [ 'error', 'prefer-double' ],
      'no-console': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': [ 'error', { args: 'none' } ],
      'no-var': 'warn',
      'prefer-template': 'warn',
      '@eslint-react/no-direct-mutation-state': 'error',
      '@eslint-react/no-missing-key': 'error',
      quotes: [ 'error', 'single', { allowTemplateLiterals: true } ],
      semi: [ 'error', 'always' ],
      strict: 'warn'
    }
  }
];
