import { useState } from 'react'
import styles from './CalendarPicker.module.css'

interface Props {
  current: string
  onSelect: (date: string) => void
}

function isoFromYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPicker({ current, onSelect }: Props) {
  const [year, setYear] = useState(() => parseInt(current.slice(0, 4), 10))
  const [month, setMonth] = useState(() => parseInt(current.slice(5, 7), 10) - 1)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div data-testid="calendar-picker" className={styles.calendar}>
      <div className={styles.nav}>
        <button onClick={prevMonth} aria-label="Previous month">‹</button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      <div className={styles.grid}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className={styles.dayName}>{d}</span>
        ))}
        {blanks.map((b) => <span key={`blank-${b}`} />)}
        {days.map((d) => {
          const iso = isoFromYMD(year, month, d)
          const isSelected = iso === current
          return (
            <button
              key={d}
              data-testid={`calendar-day-${iso}`}
              className={`${styles.day} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(iso)}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
