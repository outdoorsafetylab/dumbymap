import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../test/e2e',
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:8888',
  },
})
