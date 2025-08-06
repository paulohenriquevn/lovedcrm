/** @type {import('prettier').Config} */
module.exports = {
  // Core formatting options - optimized for readability
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // Language-specific formatting
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        singleQuote: true,
        semi: false,
        trailingComma: 'es5',
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        singleQuote: false,
        trailingComma: 'none',
        printWidth: 80,
      },
    },
    {
      files: '*.{md,mdx}',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        singleQuote: false,
      },
    },
    {
      files: '*.{css,scss,sass}',
      options: {
        singleQuote: true,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: true,
        tabWidth: 2,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'css',
      },
    },
  ],

  // Plugin configurations
  plugins: [],
}
