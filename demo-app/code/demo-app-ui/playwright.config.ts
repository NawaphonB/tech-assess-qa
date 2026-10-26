import { defineConfig, devices } from '@playwright/test';

/**
 * API and end-to-end tests against the running Docker Compose stack
 * (start it with ./start-infra.sh and ./start-app.sh first).
 */
export const UI_URL = process.env.UI_URL ?? 'http://localhost:3001';
export const BFF_URL = process.env.BFF_URL ?? 'http://localhost:8090';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: BFF_URL },
    },
    {
      name: 'e2e',
      testMatch: 'e2e/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: UI_URL },
    },
  ],
});
