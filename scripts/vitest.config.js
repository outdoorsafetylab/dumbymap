import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    exclude: ['test/e2e/**', 'node_modules/**'],
  },
})
