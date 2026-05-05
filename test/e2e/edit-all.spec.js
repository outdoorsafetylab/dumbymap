import { test, expect } from '@playwright/test'

test.describe('Edit ALL', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example/01-basic-maps.html')
    await page.waitForSelector('.Dumby[data-layout]', { timeout: 15000 })
  })

  test('"Edit ALL" appears in context menu when right-clicking a block', async ({ page }) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    const menu = page.locator('.dumby-menu')
    await expect(menu).toBeVisible({ timeout: 3000 })
    await expect(menu.getByText('Edit ALL')).toBeVisible()
  })

  test('"Edit ALL" opens modal with "Edit ALL" title', async ({ page }) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    const overlay = page.locator('.dumby-edit-overlay.open')
    await expect(overlay).toBeVisible({ timeout: 3000 })
    await expect(overlay.locator('.dumby-edit-header span').first()).toHaveText('Edit ALL')
  })

  test('"Edit ALL" textarea contains markdown from all blocks', async ({ page }) => {
    const blockCount = await page.locator('.dumby-block').count()
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    await expect(page.locator('.dumby-edit-overlay.open')).toBeVisible({ timeout: 3000 })

    const value = await page.locator('.dumby-edit-textarea').inputValue()
    expect(value.trim().length).toBeGreaterThan(0)
    // Multiple blocks are joined by 3 newlines (2 blank lines = block boundary for splitMd)
    if (blockCount > 1) {
      expect(value).toContain('\n\n\n')
    }
  })

  test('saving "Edit ALL" replaces all blocks with edited content', async ({ page }) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    await expect(page.locator('.dumby-edit-overlay.open')).toBeVisible({ timeout: 3000 })

    // Two blocks separated by 2 blank lines
    await page.locator('.dumby-edit-textarea').fill('Block One\n\n\nBlock Two')
    await page.locator('.dumby-edit-save').click()

    await expect(page.locator('.dumby-edit-overlay.open')).toHaveCount(0, { timeout: 3000 })
    await expect(page.locator('.dumby-block')).toHaveCount(2, { timeout: 3000 })
  })

  test('Ctrl+Enter saves "Edit ALL" and closes modal', async ({ page }) => {
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    await expect(page.locator('.dumby-edit-overlay.open')).toBeVisible({ timeout: 3000 })

    await page.locator('.dumby-edit-textarea').fill('Only One Block')
    await page.locator('.dumby-edit-textarea').press('Control+Enter')

    await expect(page.locator('.dumby-edit-overlay.open')).toHaveCount(0, { timeout: 3000 })
    await expect(page.locator('.dumby-block')).toHaveCount(1, { timeout: 3000 })
  })

  test('Esc cancels "Edit ALL" without changing blocks', async ({ page }) => {
    const originalCount = await page.locator('.dumby-block').count()

    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    await expect(page.locator('.dumby-edit-overlay.open')).toBeVisible({ timeout: 3000 })

    await page.locator('.dumby-edit-textarea').fill('Cancelled edit')
    await page.keyboard.press('Escape')

    await expect(page.locator('.dumby-edit-overlay.open')).toHaveCount(0, { timeout: 3000 })
    await expect(page.locator('.dumby-block')).toHaveCount(originalCount)
  })

  test('"Edit Block" on 5th block (table block) shows markdown table, not <table> HTML', async ({ page }) => {
    const block = page.locator('.dumby-block').nth(4)
    await block.click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit Block').click()

    const overlay = page.locator('.dumby-edit-overlay.open')
    await expect(overlay).toBeVisible({ timeout: 3000 })

    const value = await page.locator('.dumby-edit-textarea').inputValue()
    expect(value).not.toContain('<table>')
    expect(value).toContain('| --- |')
  })

  test('"Edit Block" still works after "Edit ALL" was opened', async ({ page }) => {
    // Open Edit ALL then close it
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit ALL').click()
    await expect(page.locator('.dumby-edit-overlay.open')).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(page.locator('.dumby-edit-overlay.open')).toHaveCount(0, { timeout: 3000 })

    // Now open Edit Block — title should be "Edit Block"
    await page.locator('.dumby-block').first().click({ button: 'right' })
    await page.locator('.dumby-menu').getByText('Edit Block').click()
    const overlay = page.locator('.dumby-edit-overlay.open')
    await expect(overlay).toBeVisible({ timeout: 3000 })
    await expect(overlay.locator('.dumby-edit-header span').first()).toHaveText('Edit Block')
  })
})
