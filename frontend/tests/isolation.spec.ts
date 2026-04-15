import { test, expect } from '@playwright/test'
import { TEST_USER, TEST_USER_2, registerUser, loginViaUI, todayISO } from './helpers'

test.describe('User isolation', () => {
  test.beforeEach(async ({ page }) => {
    // Register both users
    await registerUser(page, TEST_USER.username, TEST_USER.password)
    await registerUser(page, TEST_USER_2.username, TEST_USER_2.password)
  })

  test('user cannot see tasks created by another user', async ({ page }) => {
    // Login as user 1 and create a task
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByTestId('task-description-input').first().fill('Secret task user1')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('task-list')).toContainText('Secret task user1')

    // Logout
    await page.getByRole('button', { name: /log out/i }).click()
    await expect(page).toHaveURL('/')

    // Login as user 2 — should not see user 1's task
    await loginViaUI(page, TEST_USER_2.username, TEST_USER_2.password)
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByTestId('task-list')).not.toContainText('Secret task user1')
  })

  test('user cannot delete a task belonging to another user via API', async ({ page }) => {
    // Login as user 1 and create a task
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await page.getByTestId('task-description-input').first().fill('User1 task')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()

    // Get the task id from the API
    const today = todayISO()
    const tasksRes = await page.request.get(`/api/tasks?date=${today}`)
    const { tasks } = await tasksRes.json() as { tasks: Array<{ id: string }> }
    expect(tasks.length).toBeGreaterThan(0)
    const taskId = tasks[0].id

    // Logout and login as user 2
    await page.request.post('/api/auth/logout')
    await loginViaUI(page, TEST_USER_2.username, TEST_USER_2.password)

    // Attempt to delete user 1's task
    const deleteRes = await page.request.delete(`/api/tasks/${taskId}`)
    expect(deleteRes.status()).toBe(404)
  })

  test('user cannot update a task belonging to another user via API', async ({ page }) => {
    // Login as user 1 and create a task
    await loginViaUI(page, TEST_USER.username, TEST_USER.password)
    await page.getByTestId('task-description-input').first().fill('User1 task to protect')
    await page.getByTestId('task-duration-input').first().fill('1')
    await page.getByRole('button', { name: /save/i }).click()

    const today = todayISO()
    const tasksRes = await page.request.get(`/api/tasks?date=${today}`)
    const { tasks } = await tasksRes.json() as { tasks: Array<{ id: string }> }
    const taskId = tasks[0].id

    // Switch to user 2
    await page.request.post('/api/auth/logout')
    await loginViaUI(page, TEST_USER_2.username, TEST_USER_2.password)

    const patchRes = await page.request.patch(`/api/tasks/${taskId}`, {
      data: { description: 'hacked', duration: '1', task_date: today },
    })
    expect(patchRes.status()).toBe(404)
  })
})
