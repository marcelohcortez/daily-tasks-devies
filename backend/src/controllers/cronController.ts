import { Request, Response } from 'express'
import { Resend } from 'resend'
import { db } from '../models/db'

const resend = new Resend(process.env.RESEND_API_KEY)

function todayCET(): string {
  // Get current date in CET/CEST (Europe/Paris = UTC+1 or UTC+2)
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

export async function sendReminders(req: Request, res: Response): Promise<void> {
  // Verify cron secret
  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const today = todayCET()

  // Fetch all reminder tasks for today with user email
  const result = await db.execute({
    sql: `SELECT t.id, t.description, t.duration, t.user_id, u.email, u.username
          FROM tasks t
          JOIN users u ON t.user_id = u.id
          WHERE t.task_date = ? AND t.reminder_enabled = 1 AND u.email IS NOT NULL`,
    args: [today],
  })

  if (result.rows.length === 0) {
    res.json({ sent: 0 })
    return
  }

  // Group tasks by user
  const byUser = new Map<string, { email: string; username: string; tasks: Array<{ description: string; duration: string | null }> }>()
  for (const row of result.rows) {
    const userId = row.user_id as string
    if (!byUser.has(userId)) {
      byUser.set(userId, {
        email: row.email as string,
        username: row.username as string,
        tasks: [],
      })
    }
    byUser.get(userId)!.tasks.push({
      description: row.description as string,
      duration: row.duration as string | null,
    })
  }

  const fromAddress = process.env.EMAIL_FROM ?? 'Daily Tasks <noreply@example.com>'
  const dateLabel = new Date().toLocaleDateString('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let sent = 0
  for (const { email, username, tasks } of byUser.values()) {
    const taskLines = tasks
      .map((t) => `• ${t.description}${t.duration ? ` (${t.duration})` : ''}`)
      .join('\n')

    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Your tasks for ${dateLabel}`,
      text: `Hi ${username},\n\nHere are your tasks for today (${dateLabel}):\n\n${taskLines}\n\nGood luck!\n— Daily Tasks`,
    })
    sent++
  }

  res.json({ sent })
}
