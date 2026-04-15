/**
 * Parses a whole-number hours value into a normalized form and total minutes.
 * Accepted input: a positive integer string, e.g. "1", "2", "3".
 */
export function parseDuration(raw: string): { stored: string; minutes: number } {
  const trimmed = raw.trim()
  const hours = Number(trimmed)

  if (!Number.isInteger(hours) || hours <= 0 || String(hours) !== trimmed) {
    throw new Error(`Duration must be a positive whole number of hours (e.g. 1, 2, 3): "${raw}"`)
  }

  return { stored: `${hours}h`, minutes: hours * 60 }
}

/**
 * Formats a total number of minutes into a human-readable string: "Xh"
 */
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0h'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}
