import { test, expect } from '@playwright/test'

test.describe('GeoLinks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/02-geolinks.html')
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
  })

  test('geolink elements are rendered', async ({ page }) => {
    const count = await page.locator('a.geolink').count()
    expect(count).toBeGreaterThan(0)
  })

  test('geolinks carry lon/lat data attributes', async ({ page }) => {
    const link = page.locator('a.geolink').first()
    const lon = await link.getAttribute('data-lon')
    const lat = await link.getAttribute('data-lat')
    expect(parseFloat(lon)).not.toBeNaN()
    expect(parseFloat(lat)).not.toBeNaN()
  })

  test('geolink title describes interactions', async ({ page }) => {
    const title = await page.locator('a.geolink').first().getAttribute('title')
    expect(title).toContain('Left-Click')
  })

  test('clicking a geolink places a marker on a rendered map', async ({ page }) => {
    await page.waitForSelector('.mapclay[data-render="fulfilled"]', { timeout: 20000 })
    await page.locator('a.geolink').first().click()
    await expect(page.locator('.mapclay [data-xy]').first()).toBeAttached({ timeout: 5000 })
  })

  test('middle-clicking a geolink removes its markers', async ({ page }) => {
    await page.waitForSelector('.mapclay[data-render="fulfilled"]', { timeout: 20000 })

    // Place a marker first
    await page.locator('a.geolink').first().click()
    await page.waitForSelector('.mapclay [data-xy]')

    // Middle-click removes it
    await page.locator('a.geolink').first().click({ button: 'middle' })
    await expect(page.locator('.mapclay [data-xy]')).toHaveCount(0, { timeout: 3000 })
  })
})
