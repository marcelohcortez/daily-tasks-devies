import PDFDocument from 'pdfkit'
import { Response } from 'express'
import { db } from '../models/db'
import { AuthRequest } from '../middleware/auth'
import { formatMinutes } from '../utils/duration'

// ── Date range helpers ────────────────────────────────────────────────────────

function getWeekRange(dateStr: string): [string, string] {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay() // 0=Sun … 6=Sat
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const mon = new Date(d)
  mon.setDate(d.getDate() + diffToMon)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return [mon.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)]
}

function getMonthRange(dateStr: string): [string, string] {
  const [year, month] = dateStr.split('-').map(Number)
  const first = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const last = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return [first, last]
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Controller ────────────────────────────────────────────────────────────────

export async function exportPdf(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId
  const username = req.user!.username

  const period = req.query.period
  const dateParam = req.query.date

  if (period !== 'week' && period !== 'month') {
    res.status(400).json({ message: 'period must be "week" or "month"' })
    return
  }

  if (typeof dateParam !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    res.status(400).json({ message: 'date must be in YYYY-MM-DD format' })
    return
  }

  const [from, to] = period === 'week' ? getWeekRange(dateParam) : getMonthRange(dateParam)

  const result = await db.execute({
    sql: `SELECT description, duration, duration_min, task_date
          FROM tasks
          WHERE user_id = ? AND task_date >= ? AND task_date <= ?
          ORDER BY task_date ASC, created_at ASC`,
    args: [userId, from, to],
  })

  // Group rows by date
  const byDay = new Map<string, Array<{ description: string; duration: string; duration_min: number }>>()
  for (const row of result.rows) {
    const d = row.task_date as string
    if (!byDay.has(d)) byDay.set(d, [])
    byDay.get(d)!.push({
      description: row.description as string,
      duration: row.duration as string,
      duration_min: (row.duration_min as number) ?? 0,
    })
  }

  // Build list of all dates in range (including empty days)
  const dates: string[] = []
  const cur = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }

  const rangeLabel =
    from === to
      ? formatDateLabel(from)
      : `${formatDateLabel(from)} – ${formatDateLabel(to)}`

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const doc = new PDFDocument({ margin: 50, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="tasks-${period}-${dateParam}.pdf"`
  )
  doc.pipe(res)

  // Title
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Daily Tasks', { align: 'center' })
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(username, { align: 'center' })
  doc
    .fontSize(10)
    .fillColor('#6b7280')
    .text(rangeLabel, { align: 'center' })
  doc.fillColor('#000000').moveDown(1.5)

  let grandTotal = 0

  for (const date of dates) {
    const tasks = byDay.get(date) ?? []
    const dayTotal = tasks.reduce((sum, t) => sum + (t.duration_min ?? 0), 0)

    // Day heading
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(formatDateLabel(date))

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke()
    doc.moveDown(0.3)

    if (tasks.length === 0) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text('  No tasks', { indent: 10 })
      doc.fillColor('#000000')
    } else {
      for (const task of tasks) {
        const durLabel = task.duration ? task.duration : '—'
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`  • ${task.description}`, { continued: true, indent: 10 })
          .font('Helvetica-Oblique')
          .fillColor('#6b7280')
          .text(`  ${durLabel}`, { align: 'right' })
          .fillColor('#000000')
      }

      if (dayTotal > 0) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text(`Daily total: ${formatMinutes(dayTotal)}`, { align: 'right' })
          .fillColor('#000000')
      }
    }

    doc.moveDown(1)
    grandTotal += dayTotal
  }

  // Grand total
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#374151').lineWidth(1.5).stroke()
  doc.moveDown(0.5)
  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(
      `Grand total: ${grandTotal > 0 ? formatMinutes(grandTotal) : '0h'}`,
      { align: 'right' }
    )

  doc.end()
}
