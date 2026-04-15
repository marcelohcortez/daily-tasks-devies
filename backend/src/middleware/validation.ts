import { Request, Response, NextFunction } from 'express'

/**
 * Sanitizes a string value — strips leading/trailing whitespace,
 * rejects strings that are empty after trimming.
 */
export function sanitizeString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`)
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} must not be empty`)
  }
  return trimmed
}

export class ValidationError extends Error {
  status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(err.status).json({ message: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
}
