/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'turbo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    // Désactivé pour éviter l'exigence de parserServices/project dans tous les paquets
    '@typescript-eslint/no-misused-promises': 'off',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  },
  ignorePatterns: [
    '**/*.config.js',
    '**/*.config.cjs',
    '**/.eslintrc.cjs',
    '.next',
    'dist',
    'pnpm-lock.yaml',
  ],
  reportUnusedDisableDirectives: true,
}
