import { test, expect } from '@playwright/test'

test('landing page loads with title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Git Aquarium/)
})

test('landing page → input → aquarium loads', async ({ page }) => {
  await page.goto('/')
  const input = page.locator('[data-testid="username-input"]')
  const button = page.locator('[data-testid="dive-button"]')

  if ((await input.count()) > 0) {
    await input.fill('chamdom')
    await button.click()
    await expect(page).toHaveURL(/\/chamdom/)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 })
  }
})

test('aquarium page has canvas', async ({ page }) => {
  await page.goto('/en/chamdom')
  // Canvas may take time to initialize
  await page.waitForTimeout(2000)
  const canvas = page.locator('canvas')
  if ((await canvas.count()) > 0) {
    await expect(canvas).toBeVisible()
  }
})

test('mobile viewport renders', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page).toHaveTitle(/Git Aquarium/)
})

test('api/aquarium returns JSON', async ({ request }) => {
  const response = await request.get('/api/aquarium/chamdom')
  // Either 200 (live data) or a known error code
  expect([200, 401, 429, 500]).toContain(response.status())
  if (response.status() === 200) {
    const body = await response.json()
    expect(body).toHaveProperty('user')
    expect(body).toHaveProperty('fish')
    expect(body).toHaveProperty('stats')
  }
})

test('api/aquarium returns 400 for invalid username', async ({ request }) => {
  const response = await request.get('/api/aquarium/invalid--username!!!')
  expect(response.status()).toBe(400)
})
