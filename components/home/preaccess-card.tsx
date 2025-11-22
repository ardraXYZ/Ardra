"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ExternalLink, LogIn, LayoutDashboard } from "lucide-react"

type ExchangeLink = { id: string; name: string; url: string }

// Same referral targets used on /profile (Open farm)
const EXCHANGES: ExchangeLink[] = [
  { id: "aster", name: "Aster", url: "https://www.asterdex.com/en/referral/c67143" },
  { id: "hyperliquid", name: "Hyperliquid", url: "https://app.hyperliquid.xyz/join/ARDRA" },
  { id: "hibachi", name: "Hibachi", url: "https://hibachi.xyz/r/ardrahub" },
  { id: "paradex", name: "Paradex", url: "https://app.paradex.trade/r/ardra" },
  { id: "backpack", name: "Backpack", url: "https://backpack.exchange/join/ardra" },
  { id: "avantis", name: "Avantis", url: "https://www.avantisfi.com/referral?code=ardra" },
  { id: "standx", name: "StandX", url: "https://standx.com/referral?code=Ardra" },
  { id: "outkast", name: "Outkast", url: "https://go.outkast.xyz/yvtp/EXFLFUXN" },
]

function formatCompact(n: number) {
  try {
    const s = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(n)
    return s.replace(/M\b/, "mi").replace(/B\b/, "bi")
  } catch {
    if (!Number.isFinite(n)) return "0"
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "bi"
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "mi"
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + "k"
    return String(n)
  }
}

export function PreAccessCard() {
  const supportedDexs = 9
  // lightweight client fetch for a small snapshot
  const [sumPoints, setSumPoints] = useState<number | null>(null)
  const [usersCount, setUsersCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const tryFetch = async (url: string) => {
          const r = await fetch(url, { cache: "no-store" })
          if (!r.ok) throw new Error("HTTP " + r.status)
          return r.json()
        }
        let data: any
        try { data = await tryFetch("/api/leaderboard") } catch { data = await tryFetch("/leaderboard") }
        const arr: any[] = Array.isArray(data?.leaderboard) ? data.leaderboard : Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []
        const sum = arr.reduce((acc, e) => acc + (Number(e?.totalPoints ?? e?.points ?? e?.ardraPoints ?? 0) || 0), 0)
        if (!cancelled) { setSumPoints(sum); setUsersCount(arr.length) }
      } catch {
        if (!cancelled) { setSumPoints(0); setUsersCount(0) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="site-wrap mx-auto px-6 mt-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-xl shadow-[0_25px_80px_rgba(15,118,110,0.18)]">
        <div className="pointer-events-none absolute inset-px rounded-[22px] border border-white/10 opacity-50" aria-hidden />
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: quick access */}
          <div className="space-y-5">
            <h3 className="text-xl md:text-2xl font-semibold text-white">Quick access</h3>
            <ol className="space-y-3 text-sm text-white/80">
              <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 font-medium text-white">1) Create a PerpDEX account</div>
                <div className="flex flex-wrap gap-2">
                  {EXCHANGES.map((ex) => (
                    <Link
                      key={ex.id}
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition-colors hover:border-cyan-300/50 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {ex.name}
                    </Link>
                  ))}
                </div>
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 font-medium text-white">2) Sign in with your wallet</div>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 transition-colors hover:border-white/30 hover:bg-white/10">
                  <LogIn className="h-4 w-4" /> Go to login
                </Link>
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 font-medium text-white">3) Open dashboard</div>
                <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-white transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/20">
                  <LayoutDashboard className="h-4 w-4" /> Open profile
                </Link>
              </li>
            </ol>
          </div>

          {/* Right: snapshot */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-white/50">Live snapshot</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">Ardra Hub</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Current Volume</div>
                <div className="mt-1 text-xl font-semibold text-white">${sumPoints == null ? "…" : formatCompact(sumPoints)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Total Users</div>
                <div className="mt-1 text-xl font-semibold text-white">{usersCount == null ? "…" : usersCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Supported PerpDEXs</div>
                <div className="mt-1 text-xl font-semibold text-white">{supportedDexs}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
