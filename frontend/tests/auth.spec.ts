import { test, expect } from '@playwright/test'
import { TEST_USER, registerUser, loginViaUI } from './helpers'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, TEST_USER.username, TEST_USER.password)
  })

  test('login page is shown by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /daily tasks/i })).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('login success redirects to dashboard', async ({ page }) => {
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('login failure shows error message', async ({ page }) => {
    await loginViaUI(page, TEST_USER.username, 'wrongpassword')
    await expect(page.getByRole('alert')).toContainText(/invalid/i)
    await expect(page).toHaveURL('/')
  })

  test('login failure with unknown user shows error message', async ({ page }) => {
    await loginViaUI(page, 'nobody', 'password123')
    await expect(page.getByRole('alert')).toContainText(/invalid/i)
  })

  test('unauthenticated user is redirected to login when visiting dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('authenticated user is redirected away from login page', async ({ page }) => {
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
    await page.getByRole('button', { name: /log out/i }).click()
    await expect(page).toHaveURL('/')
    // After logout, visiting dashboard redirects back to login
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })
})
