import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

type AuthContextType = {
  username: string | null
  setUsername: (u: string | null) => void
  userId: number | null
  setUserId: (id: number | null) => void
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, try to fetch current user if token present
    const token = typeof window !== 'undefined' ? localStorage.getItem('streamsight_access_token') : null
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const res = await apiFetch('/api/v1/auth/me')
        const data = await res.json()
        if (!cancelled) {
          setUsername(data.username ?? null)
          setUserId(Number(data.user_id))
        }
      } catch (err) {
        // token may be invalid; clear stored token
        localStorage.removeItem('streamsight_access_token')
        if (!cancelled) {
          setUsername(null)
          setUserId(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('streamsight_access_token')
    setUsername(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ username, setUsername, userId, setUserId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
