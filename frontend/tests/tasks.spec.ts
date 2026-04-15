import { test, expect } from '@playwright/test'
import { TEST_USER, registerUser, loginViaUI, todayISO } from './helpers'

test.describe('Tasks — create, view, edit, delete', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, TEST_USER.username, TEST_USER.password)
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('dashboard shows current date label', async ({ page }) => {
    const today = new Date()
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    await expect(page.getByTestId('current-date-label')).toContainText(formatted)
  })

  test('task input form is shown for the current day', async ({ page }) => {
    await expect(page.getByTestId('task-description-input').first()).toBeVisible()
    await expect(page.getByTestId('task-duration-input').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /add another task/i })).toBeVisible()
  })

  test('create a single task', async ({ page }) => {
    await page.getByTestId('task-description-input').first().fill('Write specs')
    await page.getByTestId('task-duration-input').first().fill('2')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByTestId('task-list')).toContainText('Write specs')
    await expect(page.getByTestId('task-list')).toContainText('2h')
  })

  test('create multiple tasks using "Add another task" button', async ({ page }) => {
    await page.getByTestId('task-description-input').first().fill('Task one')
    await page.getByTestId('task-duration-input').first().fill('1')

    await page.getByRole('button', { name: /add another task/i }).click()

    const descInputs = page.getByTestId('task-description-input')
    const durInputs = page.getByTestId('task-duration-input')
    await expect(descInputs).toHaveCount(2)

    await descInputs.nth(1).fill('Task two')
    await durInputs.nth(1).fill('2')

    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByTestId('task-list')).toContainText('Task one')
    await expect(page.getByTestId('task-list')).toContainText('Task two')
  })

  test('time summary updates after adding tasks', async ({ page }) => {
    await page.getByTestId('task-description-input').first().fill('Focus block')
    await page.getByTestId('task-duration-input').first().fill('2')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByTestId('time-summary')).toContainText('2h')

    await page.getByTestId('task-description-input').first().fill('Review')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByTestId('time-summary')).toContainText('3h')
  })

  test('edit an existing task', async ({ page }) => {
    // Create
    await page.getByTestId('task-description-input').first().fill('Initial description')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('task-list')).toContainText('Initial description')

    // Edit
    await page.getByTestId('task-list').getByRole('button', { name: /edit/i }).first().click()
    await page.getByTestId('edit-description-input').first().clear()
    await page.getByTestId('edit-description-input').first().fill('Updated description')
    await page.getByRole('button', { name: /update/i }).click()

    await expect(page.getByTestId('task-list')).toContainText('Updated description')
    await expect(page.getByTestId('task-list')).not.toContainText('Initial description')
  })

  test('delete a task requires typing "delete" to confirm', async ({ page }) => {
    // Create
    await page.getByTestId('task-description-input').first().fill('Task to delete')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('task-list')).toContainText('Task to delete')

    // Delete — open confirmation
    await page.getByTestId('task-list').getByRole('button', { name: /delete/i }).first().click()

    // Confirm button should be disabled without typing "delete"
    const confirmBtn = page.getByRole('button', { name: /confirm delete/i })
    await expect(confirmBtn).toBeDisabled()

    // Type wrong word — still disabled
    await page.getByTestId('delete-confirm-input').fill('wrong')
    await expect(confirmBtn).toBeDisabled()

    // Type "delete" — enabled
    await page.getByTestId('delete-confirm-input').clear()
    await page.getByTestId('delete-confirm-input').fill('delete')
    await expect(confirmBtn).toBeEnabled()
    await confirmBtn.click()

    await expect(page.getByTestId('task-list')).not.toContainText('Task to delete')
  })

  test('time summary decreases after deleting a task', async ({ page }) => {
    await page.getByTestId('task-description-input').first().fill('Big block')
    await page.getByTestId('task-duration-input').first().fill('2')
    await page.getByRole('button', { name: /save/i }).click()

    await page.getByRole('button', { name: /add another task/i }).click()
    await page.getByTestId('task-description-input').first().fill('Small block')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByTestId('time-summary')).toContainText('3h')

    // Delete the second task
    const deleteButtons = page.getByTestId('task-list').getByRole('button', { name: /delete/i })
    await deleteButtons.nth(1).click()
    await page.getByTestId('delete-confirm-input').fill('delete')
    await page.getByRole('button', { name: /confirm delete/i }).click()

    await expect(page.getByTestId('time-summary')).toContainText('2h')
  })

  test('empty task list shows zero time summary', async ({ page }) => {
    await expect(page.getByTestId('time-summary')).toContainText(/0\s*min|no tasks/i)
  })

  // Vercel URL param reflects viewed date
  test('URL reflects current date on load', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(`date=${todayISO()}`))
  })
})
