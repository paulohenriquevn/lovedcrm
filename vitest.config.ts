import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/api/**',
      '**/migrations/**',
      '**/tests/e2e/**',
      '**/tests/unit/**', // Exclude Python tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'api/**/*',
        'migrations/**/*',
        '.next/**/*',
        'public/**/*',
        '**/*.stories.*',
        '**/coverage/**',
        '**/dist/**',
        'vitest.config.ts',
        'next.config.js',
        'tailwind.config.js',
        'postcss.config.js',
      ],
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'containers/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
      ],
      thresholds: {
        global: {
          branches: 40,
          functions: 40,
          lines: 40,
          statements: 40,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
