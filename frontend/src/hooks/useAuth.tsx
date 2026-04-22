import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, api } from '../utils/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateEmail: (email: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const { user } = await api.auth.login(username, password)
    setUser(user)
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
  }

  async function updateEmail(email: string | null) {
    await api.auth.updateProfile(email)
    setUser((prev) => prev ? { ...prev, email } : prev)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, updateEmail }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
