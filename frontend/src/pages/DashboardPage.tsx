import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api, Task } from '../utils/api'
import { todayISO, offsetDate, formatDateLabel, formatMinutes } from '../utils/date'
import TaskList from '../components/TaskList'
import TaskForm from '../components/TaskForm'
import CalendarPicker from '../components/CalendarPicker'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const dateParam = searchParams.get('date') ?? todayISO()
  const today = todayISO()
  const isPast = dateParam < today
  const isFuture = dateParam > today

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const goToDate = useCallback(
    (d: string) => setSearchParams({ date: d }),
    [setSearchParams]
  )

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { tasks } = await api.tasks.list(dateParam)
      setTasks(tasks)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [dateParam])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration_min, 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.username}>{user?.username}</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Log Out
        </button>
      </header>

      <main className={styles.main}>
        {/* ── Date navigation ─────────────────────────────── */}
        <div className={styles.dateNav}>
          <button
            aria-label="Previous day"
            className={styles.arrowBtn}
            onClick={() => goToDate(offsetDate(dateParam, -1))}
          >
            ‹
          </button>

          <div className={styles.dateCenter}>
            <span data-testid="current-date-label" className={styles.dateLabel}>
              {formatDateLabel(dateParam)}
            </span>
            <button
              className={styles.calendarBtn}
              onClick={() => setCalendarOpen((o) => !o)}
            >
              Open calendar
            </button>
          </div>

          <button
            aria-label="Next day"
            className={styles.arrowBtn}
            onClick={() => goToDate(offsetDate(dateParam, 1))}
          >
            ›
          </button>
        </div>

        {/* ── Calendar picker ─────────────────────────────── */}
        {calendarOpen && (
          <CalendarPicker
            current={dateParam}
            onSelect={(d) => {
              goToDate(d)
              setCalendarOpen(false)
            }}
          />
        )}

        {/* ── Task form ───────────────────────────────────── */}
        {(!isPast) && (
          <TaskForm
            taskDate={dateParam}
            onSaved={fetchTasks}
          />
        )}

        {/* ── Task list ───────────────────────────────────── */}
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <TaskList
            tasks={tasks}
            taskDate={dateParam}
            onChanged={fetchTasks}
            showAddForm={isPast}
          />
        )}

        {/* ── Time summary ────────────────────────────────── */}
        <div data-testid="time-summary" className={styles.summary}>
          {tasks.length === 0
            ? 'No tasks yet · 0min'
            : `Total: ${formatMinutes(totalMinutes)}`}
        </div>

        {/* Past date: show isFuture flag visually unused but logic-complete */}
        {isFuture && null}
      </main>
    </div>
  )
}
