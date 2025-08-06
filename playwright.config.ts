import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }], ['line']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for each action */
    actionTimeout: 30000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs first to create auth states
    {
      name: 'setup',
      testMatch: /global-auth-setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /global-teardown\.ts/,
    },

    // Public tests (no authentication required)
    {
      name: 'public-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*public.*\.spec\.ts$/,
      dependencies: ['setup'],
    },
    {
      name: 'public-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*public.*\.spec\.ts$/,
      dependencies: ['setup'],
    },

    // Authenticated user tests
    {
      name: 'auth-user-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth-state-user.json',
      },
      testMatch: /.*auth.*\.spec\.ts$/,
      dependencies: ['setup'],
    },
    {
      name: 'auth-user-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth-state-user.json',
      },
      testMatch: /.*auth.*\.spec\.ts$/,
      dependencies: ['setup'],
    },

    // Admin tests
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth-state-admin.json',
      },
      testMatch: /.*admin.*\.spec\.ts$/,
      dependencies: ['setup'],
    },

    // Mobile authenticated tests
    {
      name: 'auth-mobile',
      use: {
        ...devices['Pixel 5'],
        storageState: 'auth-state-user.json',
      },
      testMatch: /.*mobile.*\.spec\.ts$/,
      dependencies: ['setup'],
    },

    // Legacy projects for backwards compatibility
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*frontend-only.*\.spec\.ts$/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  /* Test timeout */
  timeout: 60 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000,
  },

  /* Output directory */
  outputDir: 'test-results/',

  /* Global setup and teardown */
  globalSetup: './tests/e2e/global-auth-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
})
