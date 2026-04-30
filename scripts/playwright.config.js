import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../test/e2e',
  timeout: 30000,
  webServer: {
    command: 'npx serve -l 8888 .',
    url: 'http://localhost:8888',
    reuseExistingServer: true,
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:8888',
  },
})
