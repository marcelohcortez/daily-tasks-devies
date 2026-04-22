import { test, expect } from '@playwright/test'
import { TEST_USER, registerUser, loginViaUI, dateOffsetISO } from './helpers'

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, TEST_USER.username, TEST_USER.password)
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('profile link is visible in the dashboard header', async ({ page }) => {
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible()
  })

  test('clicking profile link navigates to /profile', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click()
    await expect(page).toHaveURL(/\/profile/)
  })

  test('profile page has an email input and save button', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
  })

  test('can set an email address on the profile page', async ({ page }) => {
    await page.goto('/profile')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible()
  })

  test('back navigation from profile returns to dashboard', async ({ page }) => {
    await page.goto('/profile')
    await page.getByRole('link', { name: /back|dashboard/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Reminder checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, TEST_USER.username, TEST_USER.password)
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('reminder checkbox is NOT shown on today (only future dates)', async ({ page }) => {
    // Even with an email set, reminder should not appear for today
    await page.goto('/profile')
    await page.getByLabel(/email/i).fill('user@example.com')
    await page.getByRole('button', { name: /save/i }).click()
    await page.goto(`/dashboard?date=${new Date().toISOString().slice(0, 10)}`)
    await expect(page.getByLabel(/set reminder/i)).not.toBeVisible()
  })

  test('reminder checkbox is NOT shown on a future date when user has no email', async ({ page }) => {
    const tomorrow = dateOffsetISO(1)
    await page.goto(`/dashboard?date=${tomorrow}`)
    // No email set — checkbox should not appear
    await expect(page.getByLabel(/set reminder/i)).not.toBeVisible()
  })

  test('reminder checkbox IS shown on a future date when user has an email set', async ({ page }) => {
    // Set email first
    await page.goto('/profile')
    await page.getByLabel(/email/i).fill('remind@example.com')
    await page.getByRole('button', { name: /save/i }).click()

    // Navigate to a future date
    const tomorrow = dateOffsetISO(1)
    await page.goto(`/dashboard?date=${tomorrow}`)
    await expect(page.getByLabel(/set reminder/i)).toBeVisible()
  })

  test('hint linking to profile is shown on a future date when no email set', async ({ page }) => {
    const tomorrow = dateOffsetISO(1)
    await page.goto(`/dashboard?date=${tomorrow}`)
    // Should show hint text pointing user to set their email
    await expect(page.getByText(/profile/i)).toBeVisible()
  })
})
