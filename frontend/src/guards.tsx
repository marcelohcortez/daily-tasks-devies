import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { todayISO } from './utils/date'

export function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Outlet /> : <Navigate to="/" replace />
}

export function RequireGuest() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to={`/dashboard?date=${todayISO()}`} replace /> : <Outlet />
}
