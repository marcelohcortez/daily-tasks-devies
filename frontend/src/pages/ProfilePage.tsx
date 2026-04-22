import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { todayISO } from '../utils/date'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, updateEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(user?.email ?? '')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await updateEmail(email.trim() || null)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(`/dashboard?date=${todayISO()}`)}
          >
            ← Back
          </button>
          <h1 className={styles.title}>Profile</h1>
        </div>

        <p className={styles.username}>@{user?.username}</p>

        {error && <div role="alert" className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Email updated!</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <p className={styles.hint}>Used for task reminders. Leave blank to disable reminders.</p>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
