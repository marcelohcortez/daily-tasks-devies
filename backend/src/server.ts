import app from './app'
import { initDb } from './models/db'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

async function start(): Promise<void> {
  await initDb()
  app.listen(PORT, () => {
    console.warn(`Server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
