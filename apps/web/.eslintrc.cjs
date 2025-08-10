/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@pcanalys/eslint-config/next"
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
    'turbo/no-undeclared-env-vars': 'off',
    'no-constant-condition': 'off',
  }
};
