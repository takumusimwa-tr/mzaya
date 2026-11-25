import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5177', trace: 'off', screenshot: 'off', serviceWorkers: 'block' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node scripts/browser-test-server.js', cwd: '../backend', url: 'http://127.0.0.1:5107/ready', reuseExistingServer: false, timeout: 120000 },
    { command: 'node scripts/browser-test-frontend.mjs', url: 'http://127.0.0.1:5177/login', reuseExistingServer: false, timeout: 120000 },
  ],
});
