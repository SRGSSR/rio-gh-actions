module.exports = {
  extends: ['@srgssr/eslint-config-rio'],
  ignorePatterns: ['.eslintrc.js', 'lib'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
};
