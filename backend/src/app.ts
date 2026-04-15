import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth'
import tasksRoutes from './routes/tasks'
import { errorHandler } from './middleware/validation'

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:5173'
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// ── Body & cookies ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
})

app.use(globalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => { res.json({ ok: true }) })
app.get('/health', (_req, res) => { res.json({ ok: true }) })

// ── Routes ────────────────────────────────────────────────────────────────────
// Mount on both prefixes: /api/* for local dev (Vite proxy keeps /api),
// /* for production (Vercel strips the /api routePrefix before forwarding)
app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/auth', authRoutes)
app.use('/tasks', tasksRoutes)

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

export default app
