export interface User {
  id: string
  username: string
}

export interface Task {
  id: string
  user_id: string
  description: string
  duration: string
  duration_min: number
  task_date: string
  created_at: string
  updated_at: string
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error((body as { message?: string }).message ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiFetch<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    me: () => apiFetch<{ user: User }>('/auth/me'),
    register: (username: string, password: string) =>
      apiFetch<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },
  tasks: {
    list: (date: string) => apiFetch<{ tasks: Task[] }>(`/tasks?date=${date}`),
    create: (data: { description: string; duration: string; task_date: string }) =>
      apiFetch<{ task: Task }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: { description: string; duration: string; task_date: string }
    ) => apiFetch<{ task: Task }>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
}
