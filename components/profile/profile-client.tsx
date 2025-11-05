"use client"



import { useCallback, useEffect, useMemo, useState } from "react"

import { createPortal } from "react-dom"

import Link from "next/link"

import { Copy, ExternalLink, LogOut, Sparkles } from "lucide-react"



import { useAuth } from "@/components/providers/auth-provider"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"


import { useWallet } from "@solana/wallet-adapter-react"

import { useWalletModal } from "@solana/wallet-adapter-react-ui"


import { cn } from "@/lib/utils"

import { PACIFICA_REFERRAL_CODES } from "@/lib/pacifica-codes"



type FarmMode = "evm" | "solana" | "manual"



type ReferralConfig =

  | { type: "link"; url: string }

  | { type: "codes" }

  | { type: "comingSoon"; message?: string }



type FarmEntry = {

  id: string

  name: string

  status: "live" | "soon"

  modes: FarmMode[]

  referral: ReferralConfig

}



type ChainMode = Exclude<FarmMode, "manual">

type FarmWalletValue = {
  evm?: string
  solana?: string
  manual?: string
}

type WalletState = Record<string, FarmWalletValue>

function normalizeWalletValue(farm: FarmEntry | undefined, raw: unknown): FarmWalletValue | null {
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (farm && farm.modes.includes("manual") && !farm.modes.some((mode) => mode === "evm" || mode === "solana")) {
      return { manual: trimmed }
    }
    if (isEvmAddress(trimmed)) {
      return { evm: normalizeIdentifier(trimmed) }
    }
    if (farm?.modes.includes("solana")) {
      return { solana: trimmed }
    }
    if (farm?.modes.includes("manual")) {
      return { manual: trimmed }
    }
    if (farm?.modes.includes("evm")) {
      return { evm: normalizeIdentifier(trimmed) }
    }
    return { manual: trimmed }
  }
  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  const value: FarmWalletValue = {}
  if (typeof record.evm === "string" && record.evm.trim()) {
    value.evm = normalizeIdentifier(record.evm)
  }
  if (typeof record.solana === "string" && record.solana.trim()) {
    value.solana = record.solana.trim()
  }
  if (typeof record.manual === "string" && record.manual.trim()) {
    value.manual = record.manual
  }
  return Object.keys(value).length > 0 ? value : null
}

function normalizeWalletMap(raw: unknown): WalletState {
  const map: WalletState = {}
  if (!raw || typeof raw !== "object") return map
  for (const [farmId, value] of Object.entries(raw as Record<string, unknown>)) {
    const farm = FARMS.find((entry) => entry.id === farmId)
    const normalized = normalizeWalletValue(farm, value)
    if (normalized) {
      map[farmId] = normalized
    }
  }
  return map
}

function serializeWallets(state: WalletState): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [farmId, value] of Object.entries(state)) {
    if (!value) continue
    const farm = FARMS.find((entry) => entry.id === farmId)
    const evm = typeof value.evm === "string" ? value.evm.trim() : ""
    const solana = typeof value.solana === "string" ? value.solana.trim() : ""
    const manual = typeof value.manual === "string" ? value.manual : ""
    if (farm && farm.modes.includes("manual") && !farm.modes.some((mode) => mode === "evm" || mode === "solana")) {
      if (manual.trim()) {
        result[farmId] = manual
      }
      continue
    }
    const payload: Record<string, string> = {}
    if (evm) payload.evm = normalizeIdentifier(evm)
    if (solana) payload.solana = solana
    if (manual && manual.trim() && farm?.modes.includes("manual")) {
      payload.manual = manual
    }
    if (Object.keys(payload).length > 0) {
      result[farmId] = payload
    }
  }
  return result
}

const FARMS: FarmEntry[] = [

  {

    id: "aster",

    name: "Aster",

    status: "live",

    modes: ["evm", "solana"],

    referral: { type: "link", url: "https://www.asterdex.com/en/referral/c67143" },

  },

  {

    id: "hyperliquid",

    name: "Hyperliquid",

    status: "soon",

    modes: ["evm"],

    referral: { type: "link", url: "https://app.hyperliquid.xyz/join/ARDRA" },

  },

  {

    id: "hibachi",

    name: "Hibachi",

    status: "live",

    modes: ["evm"],

    referral: { type: "link", url: "https://hibachi.xyz/r/ardra" },

  },

  {

    id: "pacifica",

    name: "Pacifica",

    status: "soon",

    modes: ["solana"],

    referral: { type: "codes" },

  },

  {

    id: "paradex",

    name: "Paradex",

    status: "soon",

    modes: ["evm"],

    referral: { type: "link", url: "https://app.paradex.trade/r/ardra" },

  },

  {

    id: "backpack",

    name: "Backpack",

    status: "live",

    modes: ["manual"],

    referral: { type: "link", url: "https://backpack.exchange/join/ardra" },

  },

  {

    id: "avantis",

    name: "Avantis",

    status: "soon",

    modes: ["evm"],

    referral: { type: "link", url: "https://www.avantisfi.com/referral?code=ardra" },

  },

  {

    id: "standx",

    name: "StandX",

    status: "soon",

    modes: ["evm", "solana"],

    referral: { type: "link", url: "https://standx.com/referral?code=Ardra" },

  },

  {

    id: "lighter",

    name: "Lighter",

    status: "soon",

    modes: ["evm"],

    referral: { type: "comingSoon", message: "Referral launching soon." },

  },

  {

    id: "apex",

    name: "Apex",

    status: "soon",

    modes: ["evm"],

    referral: { type: "comingSoon", message: "Referral launching soon." },

  },

  {

    id: "outkast",

    name: "Outkast",

    status: "soon",

    modes: ["solana"],

    referral: { type: "link", url: "https://www.outkast.xyz/?r=n99Vz" },

  },

]






type LinkMeta = { mode: ChainMode }



type LeaderboardApiRow = {

  refCode?: string

  totalPoints?: number

  feesGenerated?: number

  referralFees?: number

}



type WalletsErrorResponse = {

  error?: string

  conflicts?: string[]

}





function formatInt(n: number) {
  try {
    return Number(n).toLocaleString()
  } catch {
    return String(n)
  }
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number.isFinite(n) ? n : 0
    )
  } catch {
    return (Number(n) || 0).toFixed(2)
  }
}


export function ProfileClient() {

  const { user, loading, refresh, logout } = useAuth()

  const [wallets, setWallets] = useState<WalletState>({})

  const [saving, setSaving] = useState(false)

  const [status, setStatus] = useState<string | null>(null)

  const [conflicts, setConflicts] = useState<Set<string>>(new Set())

  const [origin, setOrigin] = useState<string>("")

  const [usernameInput, setUsernameInput] = useState<string>("")

  const [usernameSaving, setUsernameSaving] = useState(false)

  const [leaderEntry, setLeaderEntry] = useState<{

    refCode: string

    totalPoints: number

    feesGenerated: number

    referralFees: number

  } | null>(null)



  useEffect(() => {

    if (typeof window !== "undefined") {

      setOrigin(window.location.origin)

    }

  }, [])



  useEffect(() => {

    if (status) {

      const timer = setTimeout(() => setStatus(null), 4000)

      return () => clearTimeout(timer)

    }

  }, [status])



  useEffect(() => {

    if (user) {

      setWallets(normalizeWalletMap(user.wallets ?? {}))

      setUsernameInput(user.username ?? "")

    }

  }, [user])



  useEffect(() => {

    async function loadMyLeaderboard() {

      if (!user?.refCode) {

        setLeaderEntry(null)

        return

      }

      try {

        const res = await fetch("/api/leaderboard", { cache: "no-store" })

        const payload = (await res.json().catch(() => null)) as unknown

        const leaderboardRaw = Array.isArray((payload as { leaderboard?: unknown })?.leaderboard)

          ? ((payload as { leaderboard?: unknown[] }).leaderboard as unknown[])

          : []

        const mine =

          leaderboardRaw.find(

            (entry): entry is LeaderboardApiRow => isLeaderboardApiRow(entry) && entry.refCode === user.refCode

          ) || null

        if (mine) {

          setLeaderEntry({

            refCode: mine.refCode ?? user.refCode,

            totalPoints: Number(mine.totalPoints ?? 0),

            feesGenerated: Number(mine.feesGenerated ?? 0),

            referralFees: Number(mine.referralFees ?? 0),

          })

        } else {

          setLeaderEntry(null)

        }

      } catch {

        setLeaderEntry(null)

      }

    }

    void loadMyLeaderboard()

  }, [user?.refCode])



  const referralLink = useMemo(() => {

    if (!user || !origin) return null

    return `${origin}/login?ref=${user.refCode}`

  }, [user, origin])



  const stats = useMemo(

    () => [

      {

        label: "Total points",

        value: leaderEntry

          ? formatInt(leaderEntry.totalPoints)

          : formatInt(Math.round((user?.points ?? 0) + (user?.referralPoints ?? 0))),

      },

      {

        label: "Fees generated",

        value: `$${leaderEntry ? formatCurrency(leaderEntry.feesGenerated) : (user?.feesGenerated ?? 0).toFixed(2)}`,

      },

      {

        label: "Referral fees",

        value: `$${leaderEntry ? formatCurrency(leaderEntry.referralFees) : (user?.referralFees ?? 0).toFixed(2)}`,

      },

    ],

    [leaderEntry, user?.points, user?.referralPoints, user?.feesGenerated, user?.referralFees]

  )



  const handleLinkedWallet = useCallback((farmId: string, meta: LinkMeta, rawAddress: string) => {
    const address = (rawAddress ?? "").trim()
    if (!address) return
    setWallets((prev) => {
      const previous = prev[farmId] ?? {}
      const updated: FarmWalletValue = {
        ...previous,
        [meta.mode]: meta.mode === "evm" ? normalizeIdentifier(address) : address,
      }
      return {
        ...prev,
        [farmId]: updated,
      }
    })
  }, [])



  const handleManualChange = useCallback((farmId: string, value: string) => {
    setWallets((prev) => {
      const previous = prev[farmId] ?? {}
      const next: FarmWalletValue = { ...previous }
      if ((value ?? "").length === 0) {
        delete next.manual
      } else {
        next.manual = value
      }
      if (!next.evm && !next.solana && !next.manual) {
        const rest = { ...prev }
        delete rest[farmId]
        return rest
      }
      return {
        ...prev,
        [farmId]: next,
      }
    })
  }, [])



  const handleClearWallet = useCallback((farmId: string, mode: FarmMode) => {
    setWallets((prev) => {
      const existing = prev[farmId]
      if (!existing) return prev
      const next: FarmWalletValue = { ...existing }
      if (mode === "evm") delete next.evm
      if (mode === "solana") delete next.solana
      if (mode === "manual") delete next.manual
      if (!next.evm && !next.solana && !next.manual) {
        const rest = { ...prev }
        delete rest[farmId]
        return rest
      }
      return {
        ...prev,
        [farmId]: next,
      }
    })
  }, [])



  async function handleSaveWallets(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault()

    setSaving(true)

    setStatus(null)

    setConflicts(new Set())



    try {

      const payload = serializeWallets(wallets)

      const response = await fetch("/api/users/wallets", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ wallets: payload }),

      })



      if (!response.ok) {

        const payload = (await response.json().catch(() => null)) as unknown

        const parsed = parseWalletsErrorResponse(payload)

        if (response.status === 409 && parsed.conflicts.length > 0) {

          setConflicts(new Set(parsed.conflicts))

          setStatus(parsed.error ?? "One or more wallets are already linked to another account")

          return

        }

        setStatus(parsed.error ?? "Could not save wallets")

        return

      }



      await refresh()

      setStatus("Wallets updated")

    } catch (error) {

      console.error(error)

      setStatus(error instanceof Error ? error.message : "Could not save wallets")

    } finally {

      setSaving(false)

    }

  }



  if (loading) {

    return (

      <div className="grid min-h-[100svh] place-items-center bg-[#080613] text-white/60">

        Loading profile...

      </div>

    )

  }



  if (!user) {

    return (

      <div className="grid min-h-[100svh] place-items-center bg-[#080613] px-6 py-24">

        <div className="max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/80 shadow-[0_30px_120px_rgba(56,189,248,0.15)]">

          <Sparkles className="mx-auto h-10 w-10 text-cyan-300" />

          <p>You need to sign in to access your profile.</p>

          <Button asChild className="h-11 w-full rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400">

            <Link href="/login">Go to login</Link>

          </Button>

        </div>

      </div>

    )

  }



  async function handleSaveUsername() {

    setStatus(null)

    setUsernameSaving(true)

    try {

      const desired = usernameInput.trim()

      const res = await fetch("/api/users/username", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ username: desired }),

      })

      if (!res.ok) {

        const data = await res.json().catch(() => ({}))

        throw new Error(data?.error ?? "Could not update username")

      }

      await refresh()

      setStatus("Username updated")

    } catch (e) {

      console.error(e)

      setStatus(e instanceof Error ? e.message : "Could not update username")

    } finally {

      setUsernameSaving(false)

    }

  }



  return (

    <div className="relative min-h-[100svh] overflow-hidden bg-[#05040d] text-white">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.15),_transparent_60%),radial-gradient(circle_at_30%_20%,_rgba(20,184,166,0.18),_transparent_40%)]" />

      <main className="relative mx-auto w-full max-w-6xl px-6 py-24 space-y-12">

        {status ? <StatusToast message={status} onDismiss={() => setStatus(null)} /> : null}



        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.06] to-white/[0.02] p-10 shadow-[0_30px_120px_rgba(56,189,248,0.18)]">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="space-y-5">

              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-cyan-200/80">

                <Sparkles className="h-4 w-4" />

                Profile Control Center

              </div>

              <h1 className="text-4xl font-semibold text-white sm:text-5xl">Welcome back, {user.username ?? user.name}</h1>

              <p className="max-w-2xl text-sm leading-relaxed text-white/70">

                Manage your identity, share referrals and link the wallets that feed your Ardra leaderboard score.

                This console is tuned for power farmers ? every edit is instant, secure and audit ready.

              </p>

              <div className="flex flex-wrap items-center gap-3">

                <Button

                  asChild

                  variant="outline"

                  className="h-11 rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10"

                >

                  <Link href="/leaderboard">

                    <ExternalLink className="mr-2 h-4 w-4" /> View leaderboard

                  </Link>

                </Button>

                <Button

                  type="button"

                  onClick={() => {

                    void logout()

                  }}

                  className="h-11 rounded-2xl bg-cyan-500 px-6 text-black hover:bg-cyan-400"

                >

                  <LogOut className="mr-2 h-4 w-4" /> Sign out

                </Button>

              </div>

            </div>

            <div className="grid w-full max-w-sm gap-4 rounded-3xl border border-white/10 bg-[#060311]/80 p-6 text-white/80 shadow-[0_25px_80px_rgba(139,92,246,0.18)]">

              {stats.map((stat) => (

                <StatCard key={stat.label} label={stat.label} value={stat.value} />

              ))}

            </div>

          </div>

        </section>



        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">

          <div className="space-y-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8">

            <h2 className="text-xl font-semibold text-white">Display name</h2>

            <p className="text-sm text-white/60">Define how you appear on the leaderboard and across Ardra surfaces.</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <Input

                value={usernameInput}

                onChange={(event) => setUsernameInput(event.target.value)}

                placeholder="choose-a-name"

                className="bg-black/40 border-white/20 text-white"

              />

              <Button

                onClick={() => {

                  void handleSaveUsername()

                }}

                disabled={usernameSaving}

                className="h-11 rounded-2xl bg-cyan-500 px-6 text-black hover:bg-cyan-400"

              >

                {usernameSaving ? "Saving..." : "Save name"}

              </Button>

            </div>

          </div>

          <div className="space-y-4 rounded-[28px] border border-cyan-500/30 bg-cyan-500/10 p-8">

            <div className="flex items-center justify-between text-sm text-cyan-100">

              <span>Referral program</span>

              <BadgePill text="Earn 20% fees" />

            </div>

            <p className="text-sm text-white/70">

              Share your invite link. Every referred trader routes you 20% of their fees and grants you 10% of their leaderboard points.

            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <Input readOnly value={referralLink ?? "Generating link..."} className="bg-black/40 border-white/20 text-white" />

              <Button

                type="button"

                variant="outline"

                className="h-11 rounded-full border-white/20 text-white/80 hover:text-white"

                onClick={() => {

                  if (!referralLink) {

                    setStatus("Generate your link first")

                    return

                  }



                  if (typeof navigator !== "undefined" && navigator?.clipboard) {

                    navigator.clipboard

                      .writeText(referralLink)

                      .then(() => setStatus("Referral link copied"))

                      .catch((error) => {

                        console.warn(error)

                        setStatus("Copy failed, copy manually")

                      })

                  } else {

                    setStatus("Copy not supported, copy manually")

                  }

                }}

              >

                <Copy className="mr-2 h-4 w-4" /> Copy link

              </Button>

            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">

              <span>

                Referral code: <span className="font-mono tracking-wide text-white/80">{user.refCode}</span>

              </span>

            </div>

          </div>

        </section>



        <section id="farm-connections" className="space-y-6">

          <header className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-semibold text-white">Farm connections</h2>

              <p className="text-sm text-white/60">

                Link the wallet you actively use for each venue. Backpack uses aliases; all others require the connected

                wallet.

              </p>

            </div>

            <Button

              type="submit"

              form="ardra-wallet-form"

              className="h-11 rounded-2xl bg-cyan-500 px-6 text-black hover:bg-cyan-400"

              disabled={saving}

            >

              {saving ? "Saving..." : "Save changes"}

            </Button>

          </header>



          <form id="ardra-wallet-form" onSubmit={handleSaveWallets} className="grid gap-6">

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {FARMS.map((farm) => (

                <FarmWalletCard

                  key={farm.id}

                  farm={farm}

                  value={wallets[farm.id]}

                  conflicts={conflicts}

                  onManualChange={farm.modes.includes("manual") ? (value) => handleManualChange(farm.id, value) : undefined}

                  onLink={(addr, meta) => handleLinkedWallet(farm.id, meta, addr)}

                  onClear={(mode) => handleClearWallet(farm.id, mode)}

                />

              ))}

            </div>

          </form>

        </section>

      </main>

    </div>

  )

}



type FarmWalletCardProps = {
  farm: FarmEntry
  value?: FarmWalletValue
  conflicts: Set<string>
  onLink: (value: string, meta: LinkMeta) => void
  onManualChange?: (value: string) => void
  onClear: (mode: ChainMode) => void
}

function FarmWalletCard({ farm, value, conflicts, onLink, onManualChange, onClear }: FarmWalletCardProps) {
  const resolvedValue = value ?? {}

  const manualValue = resolvedValue.manual ?? ""

  const manualConflict = hasConflict(conflicts, manualValue)

  const isManual = farm.modes.includes("manual")

  const supportsEvm = farm.modes.includes("evm")

  const supportsSolana = farm.modes.includes("solana")



  const referralAction = (() => {

    if (farm.referral.type === "link") {

      return (

        <Button asChild variant="ghost" className="text-cyan-300 hover:text-cyan-100">

          <a href={farm.referral.url} target="_blank" rel="noreferrer">

            Open farm

          </a>

        </Button>

      )

    }

    if (farm.referral.type === "codes") {

      return <PacificaOpenFarmButton />

    }

    return (

      <Button type="button" variant="outline" disabled className="cursor-not-allowed border-amber-300/40 bg-amber-500/10 text-amber-100">

        Coming soon

      </Button>

    )

  })()



  return (

    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_25px_80px_rgba(56,189,248,0.1)]">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-lg font-semibold text-white">{farm.name}</h3>

          <p className="text-xs text-white/50">Secure linking via connected wallet</p>

        </div>

        <div className="flex items-center gap-2">{referralAction}</div>

      </div>



      {isManual ? (

        <div className="space-y-2">

          <Label htmlFor={`wallet-${farm.id}`} className="text-white/70">

            Backpack alias

          </Label>

          <Input

            id={`wallet-${farm.id}`}

            value={manualValue}

            placeholder="alias example: alpha beta gamma"

            className={cn(

              "bg-black/40 font-mono text-white",

              manualConflict ? "border-red-400/60" : "border-white/15"

            )}

            onChange={(event) => onManualChange?.(event.target.value)}

          />

          {manualConflict ? <p className="text-xs text-red-400">This alias is already linked to another account.</p> : null}

        </div>

      ) : (

        <ManagedWalletSection

          farm={farm}

          referral={farm.referral}

          value={resolvedValue}

          conflicts={conflicts}

          onLink={onLink}

          onClear={onClear}

          supportsEvm={supportsEvm}

          supportsSolana={supportsSolana}

        />

      )}

    </div>

  )

}



type ManagedWalletSectionProps = {

  farm: FarmEntry

  referral: ReferralConfig

  value: FarmWalletValue

  conflicts: Set<string>

  onLink: (value: string, meta: LinkMeta) => void

  onClear: (mode: ChainMode) => void

  supportsEvm: boolean

  supportsSolana: boolean

}

function ManagedWalletSection({ farm, referral, value, conflicts, onLink, onClear, supportsEvm, supportsSolana }: ManagedWalletSectionProps) {
  const helperCopy = (() => {
    if (referral.type === "codes") {
      return "Use Open farm to copy a fresh referral code."
    }
    if (referral.type === "comingSoon" && referral.message) {
      return referral.message
    }
    return null
  })()

  const entries: Array<{ mode: ChainMode; label: string; current: string }> = []
  if (supportsEvm) entries.push({ mode: "evm", label: "EVM wallet", current: value.evm ?? "" })
  if (supportsSolana) entries.push({ mode: "solana", label: "Solana wallet", current: value.solana ?? "" })

  return (
    <div className="space-y-5">
      {entries.map(({ mode, label, current }) => {
        const trimmed = (current ?? "").trim()
        const hasValue = trimmed.length > 0
        const formatted = hasValue ? formatAddressForDisplay(trimmed) : "Not linked yet"
        const conflict = hasConflict(conflicts, trimmed)

        return (
          <div key={mode} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">{label}</p>
                <p className={cn("font-mono text-sm", hasValue ? "text-white" : "text-white/45")}>{formatted}</p>
                {conflict ? (
                  <p className="text-xs text-red-400">This wallet is already linked to another account.</p>
                ) : null}
              </div>
              {hasValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full border border-white/20 bg-white/5 px-4 text-xs uppercase tracking-wide text-white transition hover:bg-white/10"
                  onClick={() => onClear(mode)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            {mode === "evm" ? (
              <EvmWalletControls currentValue={trimmed} onLink={onLink} />
            ) : (
              <SolanaWalletControls currentValue={trimmed} onLink={onLink} />
            )}
          </div>
        )
      })}
      {helperCopy ? <p className="text-xs text-cyan-100/70">{helperCopy}</p> : null}
      {farm.status === "soon" ? (
        <p className="text-xs text-white/40">Pre-link now so we can start tracking as soon as the integration goes live.</p>
      ) : null}
    </div>
  )
}

type WalletControlProps = {
  currentValue: string
  onLink: (value: string, meta: LinkMeta) => void
}

function EvmWalletControls({ currentValue, onLink }: WalletControlProps) {
  const { address, isConnected } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const normalizedCurrent = useMemo(() => normalizeIdentifier(currentValue), [currentValue])
  const normalizedConnected = useMemo(() => normalizeIdentifier(address ?? ""), [address])
  const canLink = Boolean(normalizedConnected && normalizedConnected !== normalizedCurrent)

  return (
    <div className="space-y-3">
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            type="button"
            className="h-9 w-full rounded-full bg-cyan-500 px-5 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-cyan-400 sm:w-auto"
            onClick={async () => {
              try {
                if (isConnected) await disconnectAsync()
              } catch (error) {
                console.warn("[profile][evm-disconnect]", error)
              } finally {
                openConnectModal?.()
              }
            }}
          >
            {isConnected ? "Switch wallet" : "Connect wallet"}
          </Button>
        )}
      </ConnectButton.Custom>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-full border-white/15 bg-white/5 px-5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-cyan-400 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={!canLink}
        onClick={() => {
          if (canLink && normalizedConnected) onLink(normalizedConnected, { mode: "evm" })
        }}
      >
        Link connected wallet
      </Button>
      <p className="text-xs text-white/40">
        Connected:&nbsp;
        <span className="font-mono text-white/70">
          {normalizedConnected ? formatAddressForDisplay(normalizedConnected) : "no wallet connected"}
        </span>
      </p>
    </div>
  )
}

function SolanaWalletControls({ currentValue, onLink }: WalletControlProps) {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const connectedAddress = publicKey?.toBase58() ?? ""
  const normalizedCurrent = currentValue.trim()
  const canLink = Boolean(connectedAddress && connectedAddress !== normalizedCurrent)

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="h-9 w-full rounded-full bg-purple-500 px-5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-purple-400 sm:w-auto"
        onClick={async () => {
          try {
            if (typeof disconnect === "function") await disconnect()
          } catch (err) {
            console.warn("[profile][solana-disconnect]", err)
          } finally {
            setVisible(true)
          }
        }}
      >
        {connectedAddress ? "Switch wallet" : "Connect wallet"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-full border-white/15 bg-white/5 px-5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-cyan-400 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={!canLink}
        onClick={() => {
          if (canLink) onLink(connectedAddress, { mode: "solana" })
        }}
      >
        Link connected wallet
      </Button>
      <p className="text-xs text-white/40">
        Connected:&nbsp;
        <span className="font-mono text-white/70">
          {connectedAddress ? formatAddressForDisplay(connectedAddress) : "no wallet connected"}
        </span>
      </p>
    </div>
  )
}

type LinkButtonProps = {

  onLink: (value: string, meta: LinkMeta) => void

  currentValue: string

}



function PacificaOpenFarmButton() {

  const [open, setOpen] = useState(false)

  const [mounted, setMounted] = useState(false)



  useEffect(() => {

    setMounted(true)

  }, [])



  return (

    <>

      <Button

        type="button"

        variant="ghost"

        className="text-cyan-300 hover:text-cyan-100"

        onClick={() => setOpen(true)}

      >

        Open farm

      </Button>

      {open && mounted

        ? createPortal(

            <div

              className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"

              role="dialog"

              aria-modal="true"

              onClick={() => setOpen(false)}

            >

              <div

                className="w-full max-w-md space-y-4 rounded-3xl border border-white/15 bg-black/80 p-6 text-white shadow-2xl"

                onClick={(event) => event.stopPropagation()}

              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h3 className="text-lg font-semibold">Pacifica referral</h3>

                    <p className="text-xs text-white/60">Copy a code and continue to pacifica.fi.</p>

                  </div>

                  <Button

                    type="button"

                    variant="ghost"

                    size="sm"

                    className="text-white/60 hover:text-white"

                    onClick={() => setOpen(false)}

                  >

                    Close

                  </Button>

                </div>

                <PacificaReferralSection />

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <Button asChild size="sm" variant="outline" className="border-white/20 text-white/80 hover:text-white">

                    <a href="https://pacifica.fi/" target="_blank" rel="noreferrer">

                      Go to pacifica.fi

                    </a>

                  </Button>

                  <Button size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={() => setOpen(false)}>

                    Done

                  </Button>

                </div>

              </div>

            </div>,

            document.body

          )

        : null}

    </>

  )

}



function PacificaReferralSection() {

  const { currentCode, markCurrentUsed, nextCode, resetCodes } = usePacificaReferralRotation()

  const [helper, setHelper] = useState<string | null>(null)



  const handleCopy = async () => {

    try {

      await navigator.clipboard?.writeText(currentCode)

      setHelper("Code copied to clipboard")

    } catch (error) {

      console.warn("[profile][pacifica-copy]", error)

      setHelper("Clipboard unavailable - copy manually")

    }

  }



  return (

    <div className="space-y-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4">

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-cyan-100/80">

        <span>Pacifica referral code</span>

      </div>

      <code className="block rounded-md border border-white/10 bg-black/70 px-3 py-2 text-center text-lg font-mono text-cyan-200">

        {currentCode}

      </code>

      <div className="flex flex-wrap gap-2">

        <Button onClick={handleCopy} size="sm" variant="outline" className="border-white/20 text-white/80 hover:text-white">

          Copy code

        </Button>

        <Button

          onClick={() => {

            markCurrentUsed()

            setHelper("Marked as used")

          }}

          size="sm"

          className="bg-emerald-500 text-black hover:bg-emerald-400"

        >

          Mark as used

        </Button>

        <Button

          onClick={() => {

            nextCode()

            setHelper("Showing next code")

          }}

          size="sm"

          variant="outline"

          className="border-white/20 text-white/80"

        >

          Next code

        </Button>

        <Button

          onClick={() => {

            resetCodes()

            setHelper("Codes reset")

          }}

          size="sm"

          variant="ghost"

          className="text-white/60 hover:text-white"

        >

          Reset

        </Button>

      </div>

      <p className="text-[11px] text-white/50">

        Paste this code when creating your Pacifica account. Each code can be redeemed once.

      </p>

      {helper ? <p className="text-xs text-cyan-200/80">{helper}</p> : null}

    </div>

  )

}



function usePacificaReferralRotation() {

  const [index, setIndex] = useState<number>(0)

  const [used, setUsed] = useState<Record<string, boolean>>({})



  useEffect(() => {

    if (typeof window === "undefined") return

    const rawIdx = window.localStorage.getItem("pacificaCodeIndex")

    const rawUsed = window.localStorage.getItem("pacificaUsedMap")

    if (rawIdx) setIndex(Number(rawIdx) || 0)

    if (rawUsed) {

      try {

        setUsed(JSON.parse(rawUsed) || {})

      } catch {}

    }

  }, [])



  const current = useMemo(() => {

    const total = PACIFICA_REFERRAL_CODES.length

    let i = index

    for (let j = 0; j < total; j++) {

      const code = PACIFICA_REFERRAL_CODES[i % total]

      if (!used[code]) return { code, i: i % total }

      i++

    }

    return { code: PACIFICA_REFERRAL_CODES[index % total], i: index % total }

  }, [index, used])



  const persist = (nextIdx: number, nextUsed: Record<string, boolean>) => {

    if (typeof window === "undefined") return

    window.localStorage.setItem("pacificaCodeIndex", String(nextIdx))

    window.localStorage.setItem("pacificaUsedMap", JSON.stringify(nextUsed))

  }



  const markCurrentUsed = () => {

    const nextUsed = { ...used, [current.code]: true }

    setUsed(nextUsed)

    const total = PACIFICA_REFERRAL_CODES.length

    const nextIdx = (current.i + 1) % total

    setIndex(nextIdx)

    persist(nextIdx, nextUsed)

  }



  const nextCode = () => {

    const total = PACIFICA_REFERRAL_CODES.length

    const nextIdx = (current.i + 1) % total

    setIndex(nextIdx)

    persist(nextIdx, used)

  }



  const resetCodes = () => {

    setUsed({})

    setIndex(0)

    if (typeof window !== "undefined") {

      window.localStorage.removeItem("pacificaUsedMap")

      window.localStorage.removeItem("pacificaCodeIndex")

    }

  }



  return {

    currentCode: current.code,

    markCurrentUsed,

    nextCode,

    resetCodes,

  }

}




function EvmLinkButton({ onLink, currentValue }: LinkButtonProps) {
  const { address, isConnected } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const normalizedCurrent = useMemo(() => normalizeIdentifier(currentValue), [currentValue])
  const normalizedConnected = useMemo(() => normalizeIdentifier(address ?? ""), [address])

  const linked = normalizedConnected && normalizedConnected === normalizedCurrent

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto">
          <Button
            type="button"
            className="h-10 w-full rounded-2xl bg-cyan-500 px-5 text-sm font-medium text-black transition hover:bg-cyan-400 sm:w-auto"
            onClick={async () => {
              try {
                if (isConnected) {
                  await disconnectAsync()
                }
              } catch (error) {
                console.warn("[profile][evm-disconnect]", error)
              } finally {
                openConnectModal?.()
              }
            }}
          >
            {isConnected ? "Switch EVM wallet" : "Connect EVM wallet"}
          </Button>
          {normalizedConnected ? (
            <>
              <p className="text-xs text-white/50">
                Connected wallet: <span className="font-mono text-white">{normalizedConnected}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-full rounded-full border-white/20 text-xs uppercase tracking-wide text-white transition hover:border-cyan-400 hover:bg-cyan-400/10 sm:w-auto"
                disabled={linked}
                onClick={() => onLink(normalizedConnected, { mode: "evm" })}
              >
                {linked ? "Linked" : "Link this wallet"}
              </Button>
            </>
          ) : null}
        </div>
      )}
    </ConnectButton.Custom>
  )
}

function SolanaLinkButton({ onLink, currentValue }: LinkButtonProps) {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const connectedAddress = publicKey?.toBase58() ?? ""
  const normalizedCurrent = currentValue.trim()
  const linked = connectedAddress && connectedAddress === normalizedCurrent

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto">
      <Button
        type="button"
        className="h-10 w-full rounded-2xl bg-purple-500 px-5 text-sm font-medium text-white transition hover:bg-purple-400 sm:w-auto"
        onClick={async () => {
          try {
            if (typeof disconnect === "function") {
              await disconnect()
            }
          } catch (err) {
            console.warn("[profile][solana-disconnect]", err)
          } finally {
            setVisible(true)
          }
        }}
      >
        {connectedAddress ? "Switch Solana wallet" : "Connect Solana wallet"}
      </Button>
      {connectedAddress ? (
        <>
          <p className="text-xs text-white/50">
            Connected wallet: <span className="font-mono text-white">{connectedAddress}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-8 w-full rounded-full border-white/20 text-xs uppercase tracking-wide text-white transition hover:border-cyan-400 hover:bg-cyan-400/10 sm:w-auto"
            disabled={linked}
            onClick={() => onLink(connectedAddress, { mode: "solana" })}
          >
            {linked ? "Linked" : "Link this wallet"}
          </Button>
        </>
      ) : null}
    </div>
  )
}




function StatCard({ label, value }: { label: string; value: string }) {

  return (

    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">

      <p className="text-xs uppercase tracking-[0.35em] text-white/40">{label}</p>

      <p className="mt-3 text-2xl font-semibold text-white">{value}

      </p>

    </div>

  )

}



function isEvmAddress(str: string) {

  return /^0x[0-9a-fA-F]{40}$/.test((str ?? "").trim())

}



function normalizeIdentifier(id: string) {

  const v = (id ?? "").trim()

  if (!v) return ""

  return isEvmAddress(v) ? v.toLowerCase() : v

}



function hasConflict(set: Set<string>, value: string) {

  const norm = normalizeIdentifier(value)

  return !!norm && set.has(norm)

}



function formatAddressForDisplay(value: string) {

  const trimmed = (value ?? "").trim()

  if (!trimmed) return ""

  if (trimmed.length <= 12) return trimmed

  return `${trimmed.slice(0, 6)}...${trimmed.slice(-6)}`

}



function StatusToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {

  useEffect(() => {

    const timeout = setTimeout(onDismiss, 4000)

    return () => clearTimeout(timeout)

  }, [message, onDismiss])



  return (

    <div className="fixed right-6 top-6 z-50 max-w-sm overflow-hidden rounded-2xl border border-cyan-400/30 bg-black/80 px-5 py-4 text-sm text-white shadow-[0_25px_80px_rgba(56,189,248,0.25)]">

      {message}

    </div>

  )

}



function BadgePill({ text }: { text: string }) {

  return <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-cyan-100">{text}</span>

}



function isLeaderboardApiRow(entry: unknown): entry is LeaderboardApiRow {

  if (!entry || typeof entry !== "object") return false

  const candidate = entry as Record<string, unknown>

  return typeof candidate.refCode === "string"

}



function parseWalletsErrorResponse(payload: unknown): WalletsErrorResponse {

  if (!payload || typeof payload !== "object") {

    return { error: undefined, conflicts: [] }

  }

  const candidate = payload as Record<string, unknown>

  const error = typeof candidate.error === "string" ? candidate.error : undefined

  const conflicts = Array.isArray(candidate.conflicts)

    ? candidate.conflicts.filter((item): item is string => typeof item === "string")

    : []

  return { error, conflicts }

}








































