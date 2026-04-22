import { useState, FormEvent } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { todayISO } from '../utils/date'
import styles from './TaskForm.module.css'

interface TaskRow {
  description: string
  duration: string
  reminder: boolean
}

interface Props {
  taskDate: string
  onSaved: () => void
}

export default function TaskForm({ taskDate, onSaved }: Props) {
  const { user } = useAuth()
  const isFuture = taskDate > todayISO()
  const canRemind = isFuture && !!user?.email

  const [rows, setRows] = useState<TaskRow[]>([{ description: '', duration: '', reminder: false }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateRow(index: number, field: keyof TaskRow, value: string | boolean) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { description: '', duration: '', reminder: false }])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await Promise.all(
        rows
          .filter((r) => r.description.trim())
          .map((r) =>
            api.tasks.create({
              description: r.description.trim(),
              duration: r.duration.trim(),
              task_date: taskDate,
              reminder_enabled: canRemind && r.reminder,
            })
          )
      )
      setRows([{ description: '', duration: '', reminder: false }])
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tasks')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      {rows.map((row, i) => (
        <div key={i} className={styles.row}>
          <input
            data-testid="task-description-input"
            type="text"
            placeholder="What did you work on?"
            value={row.description}
            onChange={(e) => updateRow(i, 'description', e.target.value)}
            required
            disabled={saving}
            className={styles.descInput}
          />
          <div className={styles.durWrapper}>
            <input
              data-testid="task-duration-input"
              type="number"
              min="1"
              step="1"
              placeholder="hours"
              value={row.duration}
              onChange={(e) => updateRow(i, 'duration', e.target.value)}
              disabled={saving}
              className={styles.durInput}
            />
            <span className={styles.durLabel}>hrs</span>
          </div>
          {canRemind && (
            <label className={styles.reminderLabel}>
              <input
                type="checkbox"
                checked={row.reminder}
                onChange={(e) => updateRow(i, 'reminder', e.target.checked)}
                disabled={saving}
              />
              Remind me
            </label>
          )}
          {isFuture && !user?.email && (
            <span className={styles.reminderHint}>
              <a href="/profile">Add email</a> to enable reminders
            </span>
          )}
        </div>
      ))}

      <div className={styles.actions}>
        <button type="button" onClick={addRow} disabled={saving} className={styles.addBtn}>
          + Add another task
        </button>
        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
