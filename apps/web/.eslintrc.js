/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@pcanalys/eslint-config/next.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
    'turbo/no-undeclared-env-vars': 'off',
    'import/consistent-type-specifier-style': 'off',
    'no-constant-condition': 'off',
  },
  overrides: [
    {
      files: ['**/src/test/**/*', '**/tests/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-useless-catch': 'off',
      },
    },
    {
      files: ['pages/api/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-useless-catch': 'off',
      },
    },
    {
      files: ['src/server/**/*'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'turbo/no-undeclared-env-vars': 'off',
      },
    },
  ],
}
