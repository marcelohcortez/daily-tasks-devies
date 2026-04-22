import { Response } from 'express'
import { randomUUID } from 'crypto'
import { db } from '../models/db'
import { parseDuration } from '../utils/duration'
import { sanitizeString } from '../middleware/validation'
import { AuthRequest } from '../middleware/auth'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function validateDate(value: unknown): string {
  const d = sanitizeString(value, 'task_date')
  if (!DATE_RE.test(d)) throw new Error('task_date must be in YYYY-MM-DD format')
  return d
}

export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const date = validateDate(req.query.date)

  const result = await db.execute({
    sql: 'SELECT id, description, duration, duration_min, task_date, reminder_enabled, created_at, updated_at FROM tasks WHERE user_id = ? AND task_date = ? ORDER BY created_at ASC',
    args: [userId, date],
  })

  res.json({ tasks: result.rows })
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const description = sanitizeString(req.body?.description, 'description')
  const rawDuration = req.body?.duration != null ? String(req.body.duration) : ''
  const taskDate = validateDate(req.body?.task_date)
  const reminderEnabled = req.body?.reminder_enabled === true ? 1 : 0

  const { stored, minutes } = parseDuration(rawDuration)

  const id = randomUUID()
  const now = new Date().toISOString()

  await db.execute({
    sql: 'INSERT INTO tasks (id, user_id, description, duration, duration_min, task_date, reminder_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, userId, description, stored, minutes, taskDate, reminderEnabled, now, now],
  })

  res.status(201).json({
    task: { id, user_id: userId, description, duration: stored, duration_min: minutes, task_date: taskDate, reminder_enabled: reminderEnabled, created_at: now, updated_at: now },
  })
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const taskId = String(req.params.id)

  const existing = await db.execute({
    sql: 'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
    args: [taskId, userId],
  })

  if (existing.rows.length === 0) {
    res.status(404).json({ message: 'Task not found' })
    return
  }

  const description = sanitizeString(req.body?.description, 'description')
  const rawDuration = req.body?.duration != null ? String(req.body.duration) : ''
  const taskDate = validateDate(req.body?.task_date)
  const reminderEnabled = req.body?.reminder_enabled === true ? 1 : 0

  const { stored, minutes } = parseDuration(rawDuration)
  const now = new Date().toISOString()

  await db.execute({
    sql: 'UPDATE tasks SET description = ?, duration = ?, duration_min = ?, task_date = ?, reminder_enabled = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    args: [description, stored, minutes, taskDate, reminderEnabled, now, taskId, userId],
  })

  res.json({
    task: { id: taskId, user_id: userId, description, duration: stored, duration_min: minutes, task_date: taskDate, reminder_enabled: reminderEnabled, updated_at: now },
  })
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const taskId = String(req.params.id)

  const existing = await db.execute({
    sql: 'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
    args: [taskId, userId],
  })

  if (existing.rows.length === 0) {
    res.status(404).json({ message: 'Task not found' })
    return
  }

  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    args: [taskId, userId],
  })

  res.status(204).send()
}

