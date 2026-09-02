import { defineConfig } from '@playwright/test';

const chromeExecutable = process.env.BUREAU_E2E_CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const bureauPort = process.env.BUREAU_E2E_PORT ?? '4187';
const bureauBaseUrl = `http://127.0.0.1:${bureauPort}`;

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results/playwright',
  timeout: 90_000,
  expect: { timeout: 8_000, toHaveScreenshot: { maxDiffPixelRatio: 0.015 } },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'test-results/playwright-report', open: 'never' }]],
  use: {
    baseURL: bureauBaseUrl,
    browserName: 'chromium',
    launchOptions: { executablePath: chromeExecutable },
    viewport: { width: 1366, height: 768 },
    colorScheme: 'light',
    locale: 'en-GB',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${bureauPort} --strictPort`,
    url: bureauBaseUrl,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
