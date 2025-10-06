"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type WalletValue = string | { evm?: string; solana?: string; manual?: string }

type User = {
  id: string
  name: string
  username?: string
  canEditUsername?: boolean
  email?: string
  refCode: string
  referrals?: string[]
  points: number
  referralPoints: number
  feesGenerated: number
  referralFees: number
  wallets: Record<string, WalletValue>
  authBindings: Array<{
    type: string
    providerId: string
    label?: string
    metadata?: Record<string, string>
  }>
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" })
  if (!response.ok) throw new Error("Failed to fetch session")
  const data = await response.json()
  return data.user as User | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const current = await fetchCurrentUser()
      setUser(current)
    } catch (error) {
      console.warn("[AuthProvider]", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
