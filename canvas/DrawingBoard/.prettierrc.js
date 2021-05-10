/**
 * @type import('prettier').Options
 */
const prettierConfig = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  printWidth: 80,
  jsxSingleQuote: true,
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
      },
    },
  ],
}

module.exports = prettierConfig
