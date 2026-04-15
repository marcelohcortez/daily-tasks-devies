import { useState, FormEvent } from 'react'
import { api } from '../utils/api'
import styles from './TaskForm.module.css'

interface TaskRow {
  description: string
  duration: string
}

interface Props {
  taskDate: string
  onSaved: () => void
}

export default function TaskForm({ taskDate, onSaved }: Props) {
  const [rows, setRows] = useState<TaskRow[]>([{ description: '', duration: '' }])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateRow(index: number, field: keyof TaskRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { description: '', duration: '' }])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await Promise.all(
        rows
          .filter((r) => r.description.trim() && r.duration.trim())
          .map((r) =>
            api.tasks.create({
              description: r.description.trim(),
              duration: r.duration.trim(),
              task_date: taskDate,
            })
          )
      )
      setRows([{ description: '', duration: '' }])
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
              required
              disabled={saving}
              className={styles.durInput}
            />
            <span className={styles.durLabel}>hrs</span>
          </div>
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
