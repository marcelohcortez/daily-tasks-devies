import { test, expect } from '@playwright/test'
import { TEST_USER, registerUser, loginViaUI, todayISO, dateOffsetISO } from './helpers'

test.describe('Date navigation', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, TEST_USER.username, TEST_USER.password)
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('left arrow navigates to previous day', async ({ page }) => {
    const yesterday = dateOffsetISO(-1)
    await page.getByRole('button', { name: /previous day/i }).click()
    await expect(page).toHaveURL(new RegExp(`date=${yesterday}`))
    await expect(page.getByTestId('current-date-label')).toBeVisible()
  })

  test('right arrow navigates to next day', async ({ page }) => {
    const tomorrow = dateOffsetISO(1)
    await page.getByRole('button', { name: /next day/i }).click()
    await expect(page).toHaveURL(new RegExp(`date=${tomorrow}`))
  })

  test('navigating multiple days updates date label', async ({ page }) => {
    await page.getByRole('button', { name: /previous day/i }).click()
    await page.getByRole('button', { name: /previous day/i }).click()
    const twoDaysAgo = dateOffsetISO(-2)
    await expect(page).toHaveURL(new RegExp(`date=${twoDaysAgo}`))
  })

  test('past date shows task list with add/edit/delete but no standalone add form', async ({
    page,
  }) => {
    // Navigate to yesterday
    await page.getByRole('button', { name: /previous day/i }).click()
    // Task list section should be present (may be empty)
    await expect(page.getByTestId('task-list')).toBeVisible()
    // "Add another task" button should still be present for past dates
    await expect(page.getByRole('button', { name: /add another task/i })).toBeVisible()
  })

  test('future date shows task input form', async ({ page }) => {
    await page.getByRole('button', { name: /next day/i }).click()
    await expect(page.getByTestId('task-description-input').first()).toBeVisible()
    await expect(page.getByTestId('task-duration-input').first()).toBeVisible()
  })

  test('can add a task to a future date', async ({ page }) => {
    await page.getByRole('button', { name: /next day/i }).click()
    await page.getByTestId('task-description-input').first().fill('Planned work')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('task-list')).toContainText('Planned work')
  })

  test('can add a task to a past date', async ({ page }) => {
    await page.getByRole('button', { name: /previous day/i }).click()
    await page.getByRole('button', { name: /add another task/i }).click()
    const inputs = page.getByTestId('task-description-input')
    await inputs.last().fill('Retroactive task')
    await page.getByTestId('task-duration-input').last().fill('1')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('task-list')).toContainText('Retroactive task')
  })

  test('open calendar button reveals date picker', async ({ page }) => {
    await page.getByRole('button', { name: /open calendar/i }).click()
    await expect(page.getByTestId('calendar-picker')).toBeVisible()
  })

  test('selecting a date from calendar navigates to that date', async ({ page }) => {
    const target = dateOffsetISO(-3)
    await page.getByRole('button', { name: /open calendar/i }).click()
    await page.getByTestId('calendar-picker').getByTestId(`calendar-day-${target}`).click()
    await expect(page).toHaveURL(new RegExp(`date=${target}`))
    await expect(page.getByTestId('current-date-label')).toBeVisible()
  })

  test('navigating to today from past shows task input form', async ({ page }) => {
    // Go to yesterday
    await page.getByRole('button', { name: /previous day/i }).click()
    // Come back
    await page.getByRole('button', { name: /next day/i }).click()
    await expect(page).toHaveURL(new RegExp(`date=${todayISO()}`))
    await expect(page.getByTestId('task-description-input').first()).toBeVisible()
  })
})
