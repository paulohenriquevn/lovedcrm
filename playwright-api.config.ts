import { defineConfig } from '@playwright/test'

/**
 * Playwright config for STANDALONE API testing (no frontend dependency)
 */
export default defineConfig({
  testDir: './tests/e2e/tests',
  /* Run API tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['json', { outputFile: 'test-results/api-results.json' }], ['line']],

  /* Shared settings for all the projects below. */
  use: {
    /* NO baseURL - we don't need frontend */
    // baseURL: undefined,

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure (API tests don't need this but keeping for compatibility) */
    screenshot: 'only-on-failure',

    /* Global timeout for each action */
    actionTimeout: 30000,

    /* Global timeout for navigation (not used in API tests) */
    navigationTimeout: 30000,
  },

  /* Configure projects for API testing only */
  projects: [
    // Standalone API tests (no dependencies)
    {
      name: 'api-standalone',
      use: {},
      testMatch: /.*standalone.*\.spec\.ts$/,
      // NO dependencies on global setup
    },
  ],

  /* NO webServer - we don't start frontend for API tests */
  // webServer: [],

  /* Test timeout */
  timeout: 60 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000,
  },

  /* Output directory */
  outputDir: 'test-results-api/',

  /* NO global setup and teardown for standalone API tests */
  // globalSetup: undefined,
  // globalTeardown: undefined,
})
