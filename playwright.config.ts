import { defineConfig } from '@playwright/test';
import { config } from './src/framework/config/config';

export default defineConfig({
  testDir: './src/modules',
  testMatch: '**/*.spec.ts',
  globalSetup: './src/framework/config/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // PARALLEL=true → 10 workers, PARALLEL=false → 1 worker (branch 101 only)
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : (process.env.PARALLEL === 'true' ? 10 : 1),
  timeout: 120_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],

  use: {
    baseURL: config.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: null,                          // null = use real window size (maximized)
        launchOptions: {
          args: [
            '--start-maximized',                 // main window opens maximized
            '--window-size=1920,1080',           // fallback size for popup tabs
          ],
        },
      },
    },
  ],

  outputDir: 'test-results',
});
