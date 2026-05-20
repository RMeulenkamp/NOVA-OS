'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, saveUser, clearUser } from './storage'
import type { NovaUser } from './types'

interface AuthContextValue {
  user: NovaUser | null
  isLoading: boolean
  login: (user: NovaUser) => void
  logout: () => void
  updateUser: (updates: Partial<NovaUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NovaUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getUser()
    setUser(stored)
    setIsLoading(false)
  }, [])

  function login(user: NovaUser) {
    saveUser(user)
    setUser(user)
  }

  function logout() {
    clearUser()
    setUser(null)
  }

  function updateUser(updates: Partial<NovaUser>) {
    if (!user) return
    const updated = { ...user, ...updates }
    saveUser(updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
