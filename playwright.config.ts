import { defineConfig } from '@playwright/test';
import { config } from './src/framework/config/config';

export default defineConfig({
  testDir: './src/modules',
  testMatch: '**/*.spec.ts',
  globalSetup: './src/framework/config/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 1,   // 1 worker locally = 1 browser only
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
