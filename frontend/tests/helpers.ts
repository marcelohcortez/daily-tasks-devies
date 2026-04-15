import { Page } from '@playwright/test'

export const TEST_USER = { username: 'testuser', password: 'TestPass123!' }
export const TEST_USER_2 = { username: 'testuser2', password: 'TestPass456!' }

export async function registerUser(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.request.post('/api/auth/register', {
    data: { username, password },
  })
}

export async function loginViaApi(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.request.post('/api/auth/login', {
    data: { username, password },
  })
}

export async function loginViaUI(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/')
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /log in/i }).click()
}

/** Returns today's date as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Returns a date offset from today */
export function dateOffsetISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
