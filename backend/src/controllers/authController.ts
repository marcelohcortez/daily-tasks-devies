import { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { db } from '../models/db'
import { hashPassword, verifyPassword } from '../utils/password'
import { signToken } from '../utils/jwt'
import { sanitizeString } from '../middleware/validation'
import { AuthRequest } from '../middleware/auth'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

export async function login(req: Request, res: Response): Promise<void> {
  const username = sanitizeString(req.body?.username, 'username')
  const password = sanitizeString(req.body?.password, 'password')

  const result = await db.execute({
    sql: 'SELECT id, username, password FROM users WHERE username = ?',
    args: [username],
  })

  const user = result.rows[0]
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' })
    return
  }

  const valid = await verifyPassword(password, user.password as string)
  if (!valid) {
    res.status(401).json({ message: 'Invalid username or password' })
    return
  }

  const token = signToken({ userId: user.id as string, username: user.username as string })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.json({ user: { id: user.id, username: user.username } })
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
  res.json({ message: 'Logged out' })
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const result = await db.execute({
    sql: 'SELECT id, username, email FROM users WHERE id = ?',
    args: [userId],
  })
  const user = result.rows[0]
  if (!user) { res.status(404).json({ message: 'User not found' }); return }
  res.json({ user: { id: user.id, username: user.username, email: user.email ?? null } })
}

export async function register(req: Request, res: Response): Promise<void> {
  const username = sanitizeString(req.body?.username, 'username')
  const password = sanitizeString(req.body?.password, 'password')
  const email: string | null = typeof req.body?.email === 'string' && req.body.email.trim()
    ? req.body.email.trim()
    : null

  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' })
    return
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Invalid email address' })
    return
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  })

  if (existing.rows.length > 0) {
    res.status(409).json({ message: 'Username already taken' })
    return
  }

  const id = randomUUID()
  const hashed = await hashPassword(password)
  const now = new Date().toISOString()

  await db.execute({
    sql: 'INSERT INTO users (id, username, password, email, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, username, hashed, email, now],
  })

  const token = signToken({ userId: id, username })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ user: { id, username, email } })
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const email: string | null = typeof req.body?.email === 'string' && req.body.email.trim()
    ? req.body.email.trim()
    : null

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Invalid email address' })
    return
  }

  await db.execute({
    sql: 'UPDATE users SET email = ? WHERE id = ?',
    args: [email, userId],
  })

  res.json({ user: { email } })
}

