import { test, expect } from '@playwright/test'

test.describe('DocLinks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/03-doclinks.html')
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
  })

  test('doclink elements are rendered', async ({ page }) => {
    const count = await page.locator('a.doclink').count()
    expect(count).toBeGreaterThan(0)
  })

  test('hovering a doclink highlights the target element', async ({ page }) => {
    await page.locator('a.doclink').first().hover()
    // onmouseover sets data-style on the target before drawing the leader line
    const highlighted = await page.evaluate(() =>
      document.querySelectorAll('[data-style]').length > 0,
    )
    expect(highlighted).toBe(true)
  })

  test('hovering a doclink draws a leader-line SVG', async ({ page }) => {
    await page.locator('a.doclink').first().hover()
    await expect(page.locator('body svg.leader-line')).toBeVisible({ timeout: 3000 })
  })

  test('mouse-out removes the leader line and unhighlights target', async ({ page }) => {
    await page.locator('a.doclink').first().hover()
    await page.waitForSelector('body svg.leader-line', { timeout: 3000 })

    await page.mouse.move(10, 10)
    // Leader line is removed after hide animation (300 ms)
    await expect(page.locator('body svg.leader-line')).toHaveCount(0, { timeout: 3000 })
    const stillHighlighted = await page.evaluate(() =>
      document.querySelectorAll('[data-style]').length > 0,
    )
    expect(stillHighlighted).toBe(false)
  })
})
