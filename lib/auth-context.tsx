'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, saveUser, clearUser } from './storage'
import { getSupabase } from './supabase'
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
    if (!stored) {
      setIsLoading(false)
      return
    }

    // Always load from localStorage first so the UI is instant
    setUser(stored)

    // Then silently fetch controlled fields from Supabase
    // These are fields only YOU can set: inProgram, programWeek, isPro, energyResetCompleted
    const sb = getSupabase()
    if (sb) {
      sb.from('users')
        .select('in_program, program_week, is_pro, energy_reset_completed, masterclass_completed')
        .eq('id', stored.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          const updated: NovaUser = {
            ...stored,
            inProgram: data.in_program ?? stored.inProgram,
            programWeek: data.program_week ?? stored.programWeek,
            isPro: data.is_pro ?? stored.isPro,
            energyResetCompleted: data.energy_reset_completed ?? stored.energyResetCompleted,
            masterclassCompleted: data.masterclass_completed ?? stored.masterclassCompleted,
          }
          saveUser(updated)
          setUser(updated)
        })
        .catch(() => {})
    }

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
