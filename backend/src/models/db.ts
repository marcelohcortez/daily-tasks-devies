import { createClient } from '@libsql/client'

if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_TOKEN) {
  throw new Error('TURSO_DB_URL and TURSO_DB_TOKEN must be set in environment variables')
}

export const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
})

export async function initDb(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT,
      duration_min INTEGER,
      task_date TEXT NOT NULL,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  // Migrate existing tables: add columns if they don't exist yet
  await db.executeMultiple(`
    ALTER TABLE users ADD COLUMN email TEXT;
    ALTER TABLE tasks ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0;
  `).catch(() => {
    // Columns likely already exist — ignore
  })
}
