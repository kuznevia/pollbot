// eslint.config.js
module.exports = [
  {
    files: ['**/*.ts'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
      node: require('eslint-plugin-node'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      // Основные правила ESLint
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/order': [
        'error',
        { groups: [['builtin', 'external', 'internal']] },
      ],
      'no-console': 'off',
      'node/no-unpublished-require': 'off',
    },
  },
];