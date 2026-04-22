import { useState } from 'react'
import { Task, api } from '../utils/api'
import TaskForm from './TaskForm'
import styles from './TaskList.module.css'

interface Props {
  tasks: Task[]
  taskDate: string
  onChanged: () => void
  showAddForm: boolean
}

export default function TaskList({ tasks, taskDate, onChanged, showAddForm }: Props) {
  return (
    <div data-testid="task-list" className={styles.container}>
      {tasks.length === 0 && !showAddForm && (
        <p className={styles.empty}>No tasks for this day yet.</p>
      )}

      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} taskDate={taskDate} onChanged={onChanged} />
      ))}

      {showAddForm && (
        <div className={styles.addFormWrapper}>
          <TaskForm taskDate={taskDate} onSaved={onChanged} />
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task,
  taskDate,
  onChanged,
}: {
  task: Task
  taskDate: string
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [editDesc, setEditDesc] = useState(task.description)
  const [editDur, setEditDur] = useState(task.duration)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdate() {
    setError(null)
    setSaving(true)
    try {
      await api.tasks.update(task.id, {
        description: editDesc.trim(),
        duration: editDur.trim(),
        task_date: taskDate,
      })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await api.tasks.delete(task.id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className={styles.row}>
        {error && <p className={styles.rowError}>{error}</p>}
        <input
          data-testid="edit-description-input"
          className={styles.editInput}
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          disabled={saving}
        />
        <div className={styles.editDurWrapper}>
          <input
            data-testid="edit-duration-input"
            type="number"
            min="1"
            step="1"
            placeholder="hours"
            className={styles.editDurInput}
            value={editDur}
            onChange={(e) => setEditDur(e.target.value)}
            disabled={saving}
          />
          <span className={styles.editDurLabel}>hrs</span>
        </div>
        <button onClick={handleUpdate} disabled={saving} className={styles.updateBtn}>
          Update
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={saving}
          className={styles.cancelBtn}
        >
          Cancel
        </button>
      </div>
    )
  }

  if (deleting) {
    return (
      <div className={styles.row}>
        <span className={styles.deleteWarning}>
          Type <strong>delete</strong> to confirm:
        </span>
        <input
          data-testid="delete-confirm-input"
          className={styles.deleteInput}
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          placeholder="delete"
        />
        <button
          onClick={handleDelete}
          disabled={deleteInput !== 'delete' || saving}
          className={styles.confirmDeleteBtn}
          aria-label="Confirm delete"
        >
          Confirm Delete
        </button>
        <button
          onClick={() => {
            setDeleting(false)
            setDeleteInput('')
          }}
          className={styles.cancelBtn}
        >
          Cancel
        </button>
        {error && <p className={styles.rowError}>{error}</p>}
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <span className={styles.desc}>{task.description}</span>
      <span className={styles.dur}>{task.duration || null}</span>
      <button
        aria-label="Edit task"
        onClick={() => setEditing(true)}
        className={styles.iconBtn}
      >
        ✏️
      </button>
      <button
        aria-label="Delete task"
        onClick={() => setDeleting(true)}
        className={styles.iconBtn}
      >
        🗑️
      </button>
    </div>
  )
}
