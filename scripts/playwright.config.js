import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../test/e2e',
  timeout: 30000,
  webServer: {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:8080',
    ...devices['Desktop Chrome'],
  },
})
