"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const STORAGE_KEY = "ardra-ref-code"

export function ReferralCapture() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      try {
        localStorage.setItem(STORAGE_KEY, ref)
        document.cookie = `ardra_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 30}`
      } catch (error) {
        console.warn("[ReferralCapture]", error)
      }
    }
  }, [searchParams, pathname])

  return null
}

export function readStoredReferral() {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
export function writeStoredReferral(value: string | null) {
  if (typeof window === "undefined") return
  try {
    if (value && value.trim()) {
      const normalized = value.trim().toUpperCase()
      localStorage.setItem(STORAGE_KEY, normalized)
      document.cookie = `ardra_ref=${normalized}; path=/; max-age=${60 * 60 * 24 * 30}`
    } else {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = "ardra_ref=; path=/; max-age=0"
    }
  } catch (error) {
    console.warn("[ReferralCapture] write", error)
  }
}

