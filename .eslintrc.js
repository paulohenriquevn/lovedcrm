/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
    'prettier', // Must be last to override other formatting rules
  ],
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'import', 'sonarjs', 'unicorn'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',

    // React specific rules
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Next.js handles this automatically
    'react/display-name': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Additional React best practices
    'react/jsx-key': 'error', // Ensure keys in lists
    'react/no-children-prop': 'error', // Prevent children as props
    'react/no-danger-with-children': 'error', // Prevent dangerous props with children
    'react/jsx-handler-names': [
      'error',
      {
        eventHandlerPrefix: 'handle',
        eventHandlerPropPrefix: 'on',
      },
    ], // Standardize event handler naming
    'react/button-has-type': 'error', // Require explicit button types
    'react/destructuring-assignment': ['error', 'always'], // Enforce destructuring
    'react/jsx-boolean-value': ['error', 'never'], // Consistent boolean prop syntax
    'react/jsx-no-constructed-context-values': 'error', // Prevent object creation in context
    'react/jsx-no-leaked-render': 'error', // Prevent leaked renders with logical operators
    'react/hook-use-state': 'error', // Consistent useState destructuring

    // General code quality rules following KISS, YAGNI, DRY principles
    complexity: ['error', { max: 8 }], // Reduced for KISS principle
    'max-depth': ['error', 3], // Reduced for KISS principle
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 3], // Reduced for KISS principle
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'dot-notation': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // DRY principle - avoid repetition
    'no-duplicate-imports': 'error',
    'import/no-duplicates': 'error',
    'prefer-template': 'error',
    'prefer-object-spread': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: true,
        object: true,
      },
    ],

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'error',
    'import/no-default-export': 'warn',
    'import/prefer-default-export': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',

    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',

    // Performance rules
    'react/jsx-no-bind': [
      'warn',
      {
        allowArrowFunctions: true,
        allowBind: false,
        ignoreRefs: true,
      },
    ],

    // React component patterns
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'function-expression',
      },
    ],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],

    // TypeScript best practices
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',

    // Error handling
    'prefer-promise-reject-errors': 'error',
    'no-throw-literal': 'error',

    // Naming conventions
    camelcase: [
      'error',
      {
        properties: 'always',
        ignoreDestructuring: false,
        ignoreImports: false,
        ignoreGlobals: false,
      },
    ],

    // SonarJS rules for code quality
    'sonarjs/cognitive-complexity': ['error', 8], // Reduced for KISS principle
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-small-switch': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',

    // Unicorn rules for modern JavaScript practices
    'unicorn/prevent-abbreviations': 'off', // Too strict for existing code
    'unicorn/filename-case': 'off', // Next.js has specific naming conventions
    'unicorn/no-null': 'off', // TypeScript uses null
    'unicorn/prefer-query-selector': 'off', // React doesn't use DOM queries
    'unicorn/prefer-dom-node-text-content': 'off', // React specific
    'unicorn/prefer-dom-node-append': 'off', // React specific
    'unicorn/prefer-dom-node-remove': 'off', // React specific
    'unicorn/no-array-for-each': 'off', // forEach is fine in React
    'unicorn/no-await-expression-member': 'off', // Sometimes needed
    'unicorn/prefer-top-level-await': 'off', // Not always suitable
    'unicorn/import-style': 'off', // Let import rules handle this
    'unicorn/prefer-module': 'off', // Next.js uses CommonJS in configs
    'unicorn/prefer-node-protocol': 'off', // Not necessary for this project
    'unicorn/no-anonymous-default-export': 'off', // Handled by import rules
    'unicorn/prefer-spread': 'error',
    'unicorn/prefer-ternary': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-default-parameters': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-math-trunc': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-regexp-test': 'error',
    'unicorn/throw-new-error': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/no-hex-escape': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/prefer-json-parse-buffer': 'error',
    'unicorn/prefer-code-point': 'error',
  },
  overrides: [
    // Configuration files
    {
      files: ['*.config.js', '*.config.ts', 'next.config.js', '.eslintrc.js'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    // Next.js pages and API routes
    {
      files: ['app/**/*.tsx', 'app/**/*.ts', 'pages/**/*.tsx', 'pages/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      },
    },
    // Test files
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'max-lines-per-function': 'off',
      },
    },
    // Component files - stricter rules
    {
      files: ['components/**/*.tsx', 'components/**/*.ts'],
      rules: {
        'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
        'react/display-name': 'error',
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      },
    },
    // Hooks - specific rules
    {
      files: ['hooks/**/*.ts', 'hooks/**/*.tsx'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },
    // Utilities - should be pure functions
    {
      files: ['lib/**/*.ts', 'lib/**/*.tsx', 'utils/**/*.ts', 'utils/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
        complexity: ['error', { max: 5 }],
      },
    },
  ],
  ignorePatterns: [
    '.next/',
    'node_modules/',
    'dist/',
    'build/',
    '*.d.ts',
    '.eslintrc.js',
    'api/',
    'tests/',
  ],
}
