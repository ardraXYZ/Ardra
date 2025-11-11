"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { AlertTriangle, Coins, Loader2, Network, TrendingUp, Users2 } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type LeaderboardEntry = {
  id: string
  name: string
  refCode: string
  referrerRefCode?: string | null
  points: number
  referralPoints: number
  totalPoints: number
  feesGenerated: number
  referralFees: number
  totalFees: number
  referrals: number
  perDexPoints?: number
}

type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[]
  perDex: Record<string, LeaderboardEntry[]>
}

type RankedEntry = {
  entry: LeaderboardEntry
  rank: number | null
}

type ReferralBreakdown = {
  entry: LeaderboardEntry
  creditedPoints: number
  creditedFees: number
}

const compactFormatter = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 })
const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  try {
    return numberFormatter.format(Math.round(value))
  } catch {
    return Math.round(value).toString()
  }
}

const formatCompact = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  try {
    return compactFormatter.format(value)
  } catch {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`
    return value.toFixed(1)
  }
}

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "$0"
  try {
    return currencyFormatter.format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

const prettyDexName = (slug: string) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/leaderboard", { cache: "no-store" })
        if (!response.ok) throw new Error(`status ${response.status}`)
        const payload = (await response.json()) as LeaderboardResponse
        if (!active) return
        setData(payload)
      } catch (err) {
        console.warn("[dashboard] failed to load leaderboard", err)
        if (!active) return
        setData(null)
        setError("We couldn't sync the leaderboard right now. Try again in a moment.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [reloadToken])

  const me: RankedEntry | null = useMemo(() => {
    if (!user) return null
    const entries = data?.leaderboard ?? []
    const index = entries.findIndex((entry) => entry.refCode === user.refCode)
    if (index >= 0) {
      return { entry: entries[index], rank: index + 1 }
    }
    const fallback: LeaderboardEntry = {
      id: user.refCode,
      name: user.name,
      refCode: user.refCode,
      points: 0,
      referralPoints: 0,
      totalPoints: 0,
      feesGenerated: 0,
      referralFees: 0,
      totalFees: 0,
      referrals: 0,
    }
    return { entry: fallback, rank: null }
  }, [data?.leaderboard, user])

  const perDexStats = useMemo(() => {
    if (!user || !data?.perDex) return []
    const results = Object.entries(data.perDex).map(([dex, entries]) => {
      const index = entries.findIndex((entry) => entry.refCode === user.refCode)
      if (index === -1) return null
      const entry = entries[index]
      const peers = entries.length
      const pool = entries.reduce((acc, item) => acc + Math.max(0, item.totalPoints ?? 0), 0)
      const share = pool > 0 ? (entry.totalPoints / pool) * 100 : 0
      return { dex, entry, rank: index + 1, peers, share }
    })
    const typed = results.filter(
      (stat): stat is {
        dex: string
        entry: LeaderboardEntry
        rank: number
        peers: number
        share: number
      } => Boolean(stat)
    )
    return typed.sort((a, b) => (b.entry.totalPoints ?? 0) - (a.entry.totalPoints ?? 0))
  }, [data?.perDex, user])

  const referralEntries = useMemo<ReferralBreakdown[]>(() => {
    if (!user || !data?.leaderboard || !me) return []
    const code = (user.refCode ?? "").toLowerCase()
    if (!code) return []
    const children = data.leaderboard.filter((entry) => (entry.referrerRefCode ?? "").toLowerCase() === code)
    if (!children.length) return []
    const totalChildPoints = children.reduce((acc, entry) => acc + Math.max(0, entry.points ?? 0), 0)
    const totalChildFees = children.reduce((acc, entry) => acc + Math.max(0, entry.feesGenerated ?? 0), 0)
    const perPointShare = totalChildPoints > 0 ? (me.entry.referralPoints ?? 0) / totalChildPoints : 0
    const perFeeShare = totalChildFees > 0 ? (me.entry.referralFees ?? 0) / totalChildFees : 0
    return children.map((entry) => ({
      entry,
      creditedPoints: perPointShare * Math.max(0, entry.points ?? 0),
      creditedFees: perFeeShare * Math.max(0, entry.feesGenerated ?? 0),
    }))
  }, [data?.leaderboard, me, user])

  const referralInsights = useMemo(() => {
    const entry = me?.entry
    if (!entry) return null
    const referrals = referralEntries.length || entry.referrals || 0
    const share = entry.totalPoints > 0 ? (entry.referralPoints / entry.totalPoints) * 100 : 0
    const avgPoints =
      referralEntries.length > 0
        ? referralEntries.reduce((acc, item) => acc + item.entry.points, 0) / referralEntries.length
        : referrals > 0
          ? entry.referralPoints / referrals
          : 0
    const avgFees =
      referralEntries.length > 0
        ? referralEntries.reduce((acc, item) => acc + item.entry.feesGenerated, 0) / referralEntries.length
        : referrals > 0
          ? entry.referralFees / referrals
          : 0
    return {
      referrals,
      share,
      avgPoints,
      avgFees,
    }
  }, [me, referralEntries])

  const busy = authLoading || loading

  if (!user && !authLoading) {
    return (
      <Card className="border-white/10 bg-white/[0.02] text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron">Restricted area</CardTitle>
          <CardDescription className="text-white/70">
            Sign in to sync your Ardra telemetry and see live numbers for every Perp DEX you and your referrals touch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 text-black">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white/70 hover:text-white">
            <Link href="/leaderboard">Open public leaderboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (busy) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-white/70">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
        <p>Syncing your data in real time...</p>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="space-y-10 text-white">
      {error ? (
        <Card className="border-red-500/30 bg-red-500/10 text-white">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-300" />
              <div>
                <CardTitle className="text-lg">Sync failed</CardTitle>
                <CardDescription className="text-white/70">
                  {error}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setReloadToken((token) => token + 1)}>
              Sync again
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="relative overflow-hidden border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent text-white shadow-[0_35px_140px_rgba(5,4,15,0.85)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_60%),radial-gradient(circle_at_bottom_right,_rgba(232,121,249,0.18),_transparent_70%)] opacity-70" aria-hidden />
        <CardHeader className="relative z-10">
          <CardTitle className="text-3xl font-orbitron text-glow">Mission Control</CardTitle>
          <CardDescription className="text-white/70">
            {me.rank ? `Rank #${me.rank} across Ardra.` : "You are not on the global leaderboard yet."} Every metric below blends your own runs with everything your network routes back to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Total points"
              value={formatNumber(me.entry.totalPoints)}
              helper={`${formatNumber(me.entry.points)} direct / ${formatNumber(me.entry.referralPoints)} network`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatPill
              label="Total fees credit"
              value={formatCurrency(me.entry.totalFees)}
              helper={`${formatCurrency(me.entry.feesGenerated)} self-generated`}
              icon={<Coins className="h-4 w-4" />}
            />
            <StatPill
              label="Referral share"
              value={`${referralInsights?.share.toFixed(1) ?? "0"}%`}
              helper={`${formatNumber(me.entry.referralPoints)} pts + ${formatCurrency(me.entry.referralFees)} fees`}
              icon={<Network className="h-4 w-4" />}
            />
            <StatPill
              label="Active referrals"
              value={formatNumber(referralInsights?.referrals ?? 0)}
              helper={`~${formatNumber(Math.round(referralInsights?.avgPoints ?? 0))} pts / ${formatCurrency(referralInsights?.avgFees ?? 0)} each`}
              icon={<Users2 className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-200/80">Perp DEX</p>
            <h2 className="text-2xl font-semibold">Per-venue performance</h2>
            <p className="text-sm text-white/65">
              Track points, fees, and share of pool for every venue your pilots touch.
            </p>
          </div>
          <Button asChild variant="ghost" className="text-white/70 hover:text-white">
            <Link href="/leaderboard">Open full leaderboard</Link>
          </Button>
        </div>

        {perDexStats.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {perDexStats.map((stat) => (
              <Card
                key={stat.dex}
                className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent backdrop-blur-sm text-white shadow-[0_25px_90px_rgba(5,4,15,0.75)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.28),_transparent_60%)] opacity-60" aria-hidden />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center justify-between text-xl">
                    {prettyDexName(stat.dex)}
                    <span className="text-sm font-normal text-white/70">#{stat.rank} / {stat.peers} pilots</span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {formatCompact(stat.entry.totalPoints)} pts logged on this venue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Own points</p>
                      <p className="mt-1 text-lg font-semibold">{formatNumber(stat.entry.points)}</p>
                      <p className="text-xs text-white/60">Fees: {formatCurrency(stat.entry.feesGenerated)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Referral boost</p>
                      <p className="mt-1 text-lg font-semibold">{formatNumber(stat.entry.referralPoints)}</p>
                      <p className="text-xs text-white/60">Fees: {formatCurrency(stat.entry.referralFees)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">Dominance</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400"
                        style={{ width: `${Math.min(100, Math.max(0, stat.share))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/60">{stat.share.toFixed(1)}% of this venue right now</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-white/10 bg-white/[0.015] text-white">
            <CardContent className="py-8 text-center text-white/70">
              We have not detected venue-specific activity yet. Keep farming and this block will light up automatically.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Referrals</p>
          <h2 className="text-2xl font-semibold">Network intelligence</h2>
          <p className="text-sm text-white/65">
            See every pilot riding under your ref code, the raw volume they are farming, and how much value that routes back to you.
          </p>
        </div>

        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent text-white shadow-[0_25px_90px_rgba(5,4,15,0.75)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,121,249,0.25),_transparent_65%)] opacity-60" aria-hidden />
          <CardContent className="relative z-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.25em] text-white/50">
                  <th className="py-3 pr-4 font-medium">Referral</th>
                  <th className="py-3 pr-4 font-medium">Direct points</th>
                  <th className="py-3 pr-4 font-medium">Direct fees</th>
                  <th className="py-3 pr-4 font-medium">Credited points</th>
                  <th className="py-3 pr-4 font-medium">Credited fees</th>
                </tr>
              </thead>
              <tbody>
                {referralEntries.length ? (
                  referralEntries.map(({ entry, creditedPoints, creditedFees }) => (
                    <tr key={entry.refCode} className="border-t border-white/5 text-white/80">
                      <td className="py-3 pr-4 font-medium">{entry.name}</td>
                      <td className="py-3 pr-4">{formatNumber(entry.points)}</td>
                      <td className="py-3 pr-4">{formatCurrency(entry.feesGenerated)}</td>
                      <td className="py-3 pr-4">{formatNumber(Math.round(creditedPoints))}</td>
                      <td className="py-3 pr-4">{formatCurrency(creditedFees)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-center text-white/60" colSpan={5}>
                      No referrals with recorded activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatPill({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper?: string
  icon?: ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-[0_15px_60px_rgba(5,4,15,0.6)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_65%)] opacity-60" aria-hidden />
      <div className="relative z-10 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
        {icon}
        {label}
      </div>
      <p className="relative z-10 mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="relative z-10 text-xs text-white/60">{helper}</p> : null}
    </div>
  )
}
