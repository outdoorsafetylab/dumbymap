import { test, expect } from '@playwright/test'

test.describe('basic maps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/01-basic-maps.html')
    await page.waitForSelector('.mapclay[data-render="fulfilled"]', { timeout: 20000 })
  })

  test('focusNextMap twice in side-by-side reaches Leaflet map', async ({ page }) => {
    await page.waitForFunction(
      () => document.querySelectorAll('.mapclay[data-render="fulfilled"]').length === 3,
      { timeout: 20000 },
    )
    await page.evaluate(() => {
      document.querySelectorAll('.mapclay.focus').forEach(m => m.classList.remove('focus'))
      document.querySelector('.Dumby').dataset.layout = 'side-by-side'
    })
    await page.waitForSelector('.Dumby .bar')

    const initialFocusId = await page.evaluate(() => document.querySelector('.mapclay.focus')?.id)
    expect(initialFocusId).toBe('Maplibre')

    await page.evaluate(() => window.dumbymap.utils.focusNextMap())
    await page.waitForTimeout(400)
    await page.evaluate(() => window.dumbymap.utils.focusNextMap())
    await page.waitForTimeout(400)

    const focusedId = await page.evaluate(() => document.querySelector('.mapclay.focus')?.id)
    console.log('current focus: ', focusedId)
    expect(focusedId).toBe('Leaflet')
  })
})
