import { test, expect, chromium } from '@playwright/test'
import { readFileSync } from 'fs'

test.describe('Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/01-basic-maps.html')
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
  })

  // Disable showSaveFilePicker so the <a download> fallback triggers a Playwright-catchable download
  const disableSaveFilePicker = (page) =>
    page.evaluate(() => { delete window.showSaveFilePicker })

  const openExportSubmenu = async (page) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await expect(page.locator('.dumby-menu')).toBeVisible({ timeout: 3000 })
    await page.locator('.dumby-menu .folder').filter({ hasText: 'Export' }).hover()
    await expect(page.locator('.sub-menu')).toBeVisible({ timeout: 2000 })
  }

  test('"Export" folder appears in context menu on right-click', async ({ page }) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await expect(page.locator('.dumby-menu')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.dumby-menu .folder').filter({ hasText: 'Export' })).toBeVisible()
  })

  test('"Export" submenu contains Export Markdown and Export HTML', async ({ page }) => {
    await openExportSubmenu(page)
    const sub = page.locator('.sub-menu')
    await expect(sub.getByText('Export Markdown')).toBeVisible()
    await expect(sub.getByText('Export HTML')).toBeVisible()
  })

  test.describe('Export Markdown', () => {
    test('downloads a .md file', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.sub-menu').getByText('Export Markdown').click(),
      ])

      expect(download.suggestedFilename()).toBe('document.md')
    })

    test('downloaded .md file is non-empty', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.sub-menu').getByText('Export Markdown').click(),
      ])

      const path = await download.path()
      const content = readFileSync(path, 'utf-8')
      expect(content.trim().length).toBeGreaterThan(0)
    })
  })

  test.describe('Export HTML', () => {
    test('downloads a .html file', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('.sub-menu').getByText('Export HTML').click(),
      ])

      expect(download.suggestedFilename()).toBe('document.html')
    })

    test('exported HTML initializes DumbyMap and attempts map rendering via file://', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('.sub-menu').getByText('Export HTML').click(),
      ])

      // saveAs to a stable path — download.path() is a temp tied to its browser instance
      const savedPath = '/tmp/dumbymap-export-test.html'
      await download.saveAs(savedPath)

      // Open the exported file via file://. Chrome requires --allow-file-access-from-files
      // for inline ES modules to execute from file:// origins.
      const fileBrowser = await chromium.launch({ args: ['--allow-file-access-from-files'] })
      const exportedPage = await fileBrowser.newPage()
      const errors = []
      exportedPage.on('pageerror', e => errors.push(e.message))

      await exportedPage.goto(`file://${savedPath}`)

      // DumbyMap must initialize (container gets .Dumby class early in generateMaps)
      await expect(exportedPage.locator('.Dumby')).toBeVisible({ timeout: 15000 })

      // Map containers must be created (renderer loading is attempted even if tiles need network)
      await expect(exportedPage.locator('.map-container').first()).toBeVisible({ timeout: 10000 })

      expect(errors, 'no JS page errors in exported file').toHaveLength(0)
      await fileBrowser.close()
    })

    test('exported HTML has CSS inlined and no external stylesheet links', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('.sub-menu').getByText('Export HTML').click(),
      ])

      const savedPath = '/tmp/dumbymap-export-css-test.html'
      await download.saveAs(savedPath)

      // Use the browser DOM to count link/style elements — avoids false positives from
      // JS source strings like querySelector('link[rel="stylesheet"]') in the inlined bundle
      const fileBrowser = await chromium.launch({ args: ['--allow-file-access-from-files'] })
      const checkPage = await fileBrowser.newPage()
      await checkPage.goto(`file://${savedPath}`)
      await checkPage.waitForLoadState('domcontentloaded')

      const { styleCount, linkCount } = await checkPage.evaluate(() => ({
        styleCount: document.querySelectorAll('style').length,
        linkCount: document.querySelectorAll('link[rel="stylesheet"]').length,
      }))

      expect(styleCount).toBeGreaterThan(0)
      expect(linkCount).toBe(0)
      await fileBrowser.close()
    })

    test('exported HTML has no importmap script', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('.sub-menu').getByText('Export HTML').click(),
      ])

      const savedPath = '/tmp/dumbymap-export-importmap-test.html'
      await download.saveAs(savedPath)

      const fileBrowser = await chromium.launch({ args: ['--allow-file-access-from-files'] })
      const checkPage = await fileBrowser.newPage()
      await checkPage.goto(`file://${savedPath}`)
      await checkPage.waitForLoadState('domcontentloaded')

      const importmapCount = await checkPage.evaluate(() =>
        document.querySelectorAll('script[type="importmap"]').length,
      )

      expect(importmapCount).toBe(0)
      await fileBrowser.close()
    })

    test('exported HTML has renderer data: URIs inlined', async ({ page }) => {
      await disableSaveFilePicker(page)
      await openExportSubmenu(page)

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('.sub-menu').getByText('Export HTML').click(),
      ])

      const path = await download.path()
      const html = readFileSync(path, 'utf-8')

      expect(html).toContain('data:application/javascript;base64,')
      // Original relative renderer paths should not remain
      expect(html).not.toContain('./renderers/maplibre.mjs')
      expect(html).not.toContain('./renderers/leaflet.mjs')
      expect(html).not.toContain('./renderers/openlayers.mjs')
    })
  })
})
