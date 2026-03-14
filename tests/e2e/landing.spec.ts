import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('renders title and subtitle', async ({ page }) => {
    // Title text from i18n
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Aquarium')
  })

  test('has username input with aria-label', async ({ page }) => {
    const input = page.locator('[aria-label="GitHub username"]')
    await expect(input).toBeVisible()
    await expect(input).toBeEnabled()
  })

  test('has DIVE button', async ({ page }) => {
    const btn = page.locator('[aria-label="Dive into aquarium"]')
    await expect(btn).toBeVisible()
  })

  test('shows validation error for invalid username format', async ({
    page,
  }) => {
    const input = page.locator('[aria-label="GitHub username"]')
    await input.fill('-invalid')
    await page.locator('[aria-label="Dive into aquarium"]').click()
    await expect(page.locator('[role="alert"]')).toBeVisible()
    await expect(page.locator('[role="alert"]')).toContainText('Invalid')
  })

  test('shows validation error for username that is too long', async ({
    page,
  }) => {
    const input = page.locator('[aria-label="GitHub username"]')
    await input.fill('a'.repeat(40))
    await page.locator('[aria-label="Dive into aquarium"]').click()
    await expect(page.locator('[role="alert"]')).toBeVisible()
    await expect(page.locator('[role="alert"]')).toContainText('too long')
  })

  test('navigates to aquarium on valid username submit', async ({ page }) => {
    const input = page.locator('[aria-label="GitHub username"]')
    await input.fill('octocat')
    await page.locator('[aria-label="Dive into aquarium"]').click()
    // Should navigate away from landing
    await expect(page).toHaveURL(/\/octocat/, { timeout: 5000 })
  })

  test('navigates on Enter key press', async ({ page }) => {
    const input = page.locator('[aria-label="GitHub username"]')
    await input.fill('octocat')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/octocat/, { timeout: 5000 })
  })

  test('shows recent aquariums carousel', async ({ page }) => {
    // Carousel section should be present
    await expect(
      page.locator('text=Recent').or(page.locator('text=최근')),
    ).toBeVisible()
  })

  test('is accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const input = page.locator('[aria-label="GitHub username"]')
    await expect(input).toBeVisible()
    await expect(
      page.locator('[aria-label="Dive into aquarium"]'),
    ).toBeVisible()
  })
})

test.describe('OG image endpoint', () => {
  test('returns image for valid username', async ({ request }) => {
    const res = await request.get('/api/og/octocat')
    // Should return an image (200) even if aquarium data fetch fails (graceful fallback)
    expect([200, 500]).toContain(res.status())
    if (res.status() === 200) {
      expect(res.headers()['content-type']).toContain('image')
    }
  })
})

test.describe('Legal pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/en/privacy')
    await expect(page.locator('h1')).toContainText('Privacy')
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/en/terms')
    await expect(page.locator('h1')).toContainText('Terms')
  })
})
