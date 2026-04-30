import { test, expect } from '@playwright/test'

test.describe('layout switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/04-layouts.html')
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
  })

  test('initial layout is normal', async ({ page }) => {
    const layout = await page.evaluate(() => document.querySelector('.Dumby').dataset.layout)
    expect(layout).toBe('normal')
  })

  test('side-by-side: .bar splitter appears', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'side-by-side' })
    await expect(page.locator('.Dumby .bar')).toBeVisible()
  })

  test('leaving side-by-side: .bar is removed', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'side-by-side' })
    await page.waitForSelector('.Dumby .bar')
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'normal' })
    await expect(page.locator('.Dumby .bar')).toHaveCount(0)
  })

  test('overlay: blocks are wrapped in .draggable-block', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'overlay' })
    await expect(page.locator('.SemanticHtml .draggable-block').first()).toBeVisible()
  })

  test('leaving overlay: .draggable-block wrappers are removed', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'overlay' })
    await page.waitForSelector('.SemanticHtml .draggable-block')
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'normal' })
    await expect(page.locator('.SemanticHtml .draggable-block')).toHaveCount(0)
  })

  test('sticky: .Showcase is inside a .draggable-block', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'sticky' })
    await expect(page.locator('.draggable-block .Showcase')).toBeVisible()
  })

  test('side-by-side landscape: dragging bar resizes both panels', async ({ page }) => {
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'side-by-side' })
    await page.waitForSelector('.Dumby .bar')

    const showcaseBefore = await page.locator('.Showcase').boundingBox()

    const handleBox = await page.locator('.bar .bar-handle').boundingBox()
    const cx = handleBox.x + handleBox.width / 2
    const cy = handleBox.y + handleBox.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx - 100, cy, { steps: 10 })
    await page.mouse.up()

    const showcaseAfter = await page.locator('.Showcase').boundingBox()
    expect(showcaseAfter.x).toBeLessThan(showcaseBefore.x)
    expect(showcaseAfter.width).toBeGreaterThan(showcaseBefore.width)
  })

  test('side-by-side portrait: dragging bar resizes both panels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => { document.querySelector('.Dumby').dataset.layout = 'side-by-side' })
    await page.waitForSelector('.Dumby .bar')

    const showcaseBefore = await page.locator('.Showcase').boundingBox()

    const handleBox = await page.locator('.bar .bar-handle').boundingBox()
    const cx = handleBox.x + handleBox.width / 2
    const cy = handleBox.y + handleBox.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx, cy + 100, { steps: 10 })
    await page.mouse.up()

    const showcaseAfter = await page.locator('.Showcase').boundingBox()
    expect(showcaseAfter.y).toBeGreaterThan(showcaseBefore.y)
    expect(showcaseAfter.height).toBeLessThan(showcaseBefore.height)
  })

  test('X key cycles to a different layout', async ({ page }) => {
    const before = await page.evaluate(() => document.querySelector('.Dumby').dataset.layout)
    await page.keyboard.press('x')
    await page.waitForFunction(
      before => document.querySelector('.Dumby').dataset.layout !== before,
      before,
    )
    const after = await page.evaluate(() => document.querySelector('.Dumby').dataset.layout)
    expect(after).not.toBe(before)
  })
})
