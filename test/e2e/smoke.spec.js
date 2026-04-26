import { test, expect } from '@playwright/test'

const pages = [
  'example/01-basic-maps.html',
  'example/02-geolinks.html',
  'example/03-doclinks.html',
  'example/04-layouts.html',
  'example/05-markers.html',
  'example/10-semantic-html.html',
  'example/11-html-auto-blocks.html',
]

for (const p of pages) {
  test(p, async ({ page }) => {
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('/' + p)
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
    await expect(page.locator('.Dumby')).toBeVisible()
    expect(errors, 'no JS errors').toHaveLength(0)
  })
}
