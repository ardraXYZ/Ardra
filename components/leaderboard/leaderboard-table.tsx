"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image, { type StaticImageData } from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import DiamondPng from "@/Images/Tiers/Diamond.png"
import GoldPng from "@/Images/Tiers/Gold.png"
import SilverPng from "@/Images/Tiers/Silver.png"
import BronzePng from "@/Images/Tiers/Bronze.png"
import WoodPng from "@/Images/Tiers/Wood.png"

type LeaderboardEntry = {
  id: string
  name: string
  refCode: string
  points: number
  referralPoints: number
  totalPoints: number
  feesGenerated: number
  referralFees: number
  totalFees: number
  referrals: number
}

type TierName = "Diamond" | "Gold" | "Silver" | "Bronze" | "Wood"

type ShareCapableNavigator = Navigator & {
  share?: (data: ShareData & { files?: File[] }) => Promise<void>
  canShare?: (data: ShareData & { files?: File[] }) => boolean
  userAgentData?: {
    mobile?: boolean
  }
}

const tierArt: Record<TierName, StaticImageData> = {
  Diamond: DiamondPng,
  Gold: GoldPng,
  Silver: SilverPng,
  Bronze: BronzePng,
  Wood: WoodPng,
}

const tierThemes: Record<
  TierName,
  {
    accent: string
    description: string
    imageGlow: string
    fillGlow: string
  }
> = {
  Diamond: {
    accent: "from-sky-400/50 via-cyan-300/20 to-fuchsia-400/40",
    description: "Top cohort: legendary farmers dominating fee flow.",
    imageGlow: "drop-shadow-[0_0_55px_rgba(125,211,252,0.45)]",
    fillGlow: "shadow-[0_0_40px_rgba(125,211,252,0.45)]",
  },
  Gold: {
    accent: "from-amber-300/50 via-orange-400/25 to-rose-400/30",
    description: "Top 30% - consistent execution amplifies your network.",
    imageGlow: "drop-shadow-[0_0_45px_rgba(251,191,36,0.35)]",
    fillGlow: "shadow-[0_0_32px_rgba(251,191,36,0.3)]",
  },
  Silver: {
    accent: "from-slate-100/50 via-slate-300/20 to-cyan-200/20",
    description: "Top 60% - keep pace to break into gold.",
    imageGlow: "drop-shadow-[0_0_38px_rgba(203,213,225,0.3)]",
    fillGlow: "shadow-[0_0_28px_rgba(148,163,184,0.35)]",
  },
  Bronze: {
    accent: "from-orange-300/40 via-amber-500/20 to-rose-500/25",
    description: "Top 90% - accelerate referrals to escape bronze.",
    imageGlow: "drop-shadow-[0_0_32px_rgba(250,204,21,0.28)]",
    fillGlow: "shadow-[0_0_24px_rgba(234,179,8,0.32)]",
  },
  Wood: {
    accent: "from-emerald-300/40 via-cyan-500/10 to-transparent",
    description: "Kick-off tier - every fee pushes you upward.",
    imageGlow: "drop-shadow-[0_0_28px_rgba(45,212,191,0.35)]",
    fillGlow: "shadow-[0_0_24px_rgba(45,212,191,0.3)]",
  },
}

const tierBreakpoints: Array<{ name: TierName; cutoff: number; label: string }> = [
  { name: "Wood", cutoff: 0, label: "Base" },
  { name: "Bronze", cutoff: 10, label: "Top 90%" },
  { name: "Silver", cutoff: 40, label: "Top 60%" },
  { name: "Gold", cutoff: 70, label: "Top 30%" },
  { name: "Diamond", cutoff: 90, label: "Top 10%" },
]

const DEFAULT_CAPTURE_BACKGROUND = "#020617"

export function LeaderboardTable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [shareBusy, setShareBusy] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const captureRef = useRef<HTMLDivElement | null>(null)
  const progressDotRef = useRef<HTMLDivElement | null>(null)
  const progressFillRef = useRef<HTMLDivElement | null>(null)
  const rankRef = useRef<HTMLElement | null>(null)
  const pointsRef = useRef<HTMLElement | null>(null)
  const feesRef = useRef<HTMLElement | null>(null)

  const formatInt = (n: number) => {
    try {
      return Number(n).toLocaleString()
    } catch {
      return String(n)
    }
  }
  const formatCurrency = (n: number) => {
    try {
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Number.isFinite(n as number) ? (n as number) : 0
      )
    } catch {
      return (Number(n) || 0).toFixed(2)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/leaderboard", { cache: "no-store" })
        const data = await response.json()
        setEntries(data?.leaderboard ?? [])
      } catch (error) {
        console.error(error)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const me = useMemo(() => {
    if (!user?.refCode) return null
    const idx = entries.findIndex((e) => e.refCode === user.refCode)
    return idx >= 0 ? { entry: entries[idx], rank: idx + 1 } : null
  }, [entries, user?.refCode])

  const participants = entries.length
  const percentile = useMemo(() => {
    if (!me || participants === 0) return null
    return me.rank / participants
  }, [me, participants])

  const tier = useMemo(() => {
    if (percentile == null) return null
    if (percentile <= 0.1) return { name: "Diamond" as const }
    if (percentile <= 0.3) return { name: "Gold" as const }
    if (percentile <= 0.6) return { name: "Silver" as const }
    if (percentile <= 0.9) return { name: "Bronze" as const }
    return { name: "Wood" as const }
  }, [percentile])

  const progressPercent = useMemo(() => {
    if (percentile == null) return 0
    return Math.max(0, Math.min(100, (1 - percentile) * 100))
  }, [percentile])

  const progressWidth = Math.max(0, Math.min(100, progressPercent))
  const progressDotPercent = useMemo(() => {
    if (progressWidth <= 0) return 1.5
    if (progressWidth >= 100) return 98.5
    return Math.min(98.5, Math.max(1.5, progressWidth))
  }, [progressWidth])

  const topPercentLabel = percentile != null ? Math.max(1, Math.round(percentile * 100)) : null
  const playersAhead = me ? Math.max(0, me.rank - 1) : 0
  const currentTierName: TierName = tier?.name ?? "Wood"
  const tierTheme = tierThemes[currentTierName]

  const nextTier = useMemo(() => {
    if (!me || participants <= 0) return null
    const currentProgress = progressPercent
    const upcoming = tierBreakpoints
      .filter((bp) => bp.cutoff > currentProgress)
      .sort((a, b) => a.cutoff - b.cutoff)[0]
    if (!upcoming) return null
    const requiredRank = Math.max(1, Math.ceil((1 - upcoming.cutoff / 100) * participants))
    const playersToPass = Math.max(0, me.rank - requiredRank)
    return {
      ...upcoming,
      requiredRank,
      playersToPass,
      percentGap: Math.max(0, upcoming.cutoff - currentProgress),
    }
  }, [me, participants, progressPercent])

  useEffect(() => {
    if (!me || participants <= 0) return
    let cancelled = false
    ;(async () => {
      try {
        const animeModule = await import("animejs")
        const anime = animeModule.default
        if (cancelled || typeof anime !== "function") return

        if (panelRef.current) {
          anime({
            targets: panelRef.current,
            opacity: [0, 1],
            translateY: [-12, 0],
            duration: 700,
            easing: "easeOutQuad",
          })
        }
        if (progressFillRef.current) {
          anime({
            targets: progressFillRef.current,
            scaleX: [0.75, 1],
            opacity: [0.6, 1],
            duration: 900,
            easing: "easeOutExpo",
          })
        }
        if (progressDotRef.current) {
          anime({
            targets: progressDotRef.current,
            translateX: [-14, 0],
            scale: [0.8, 1],
            duration: 850,
            delay: 120,
            easing: "easeOutBack",
          })
        }
        const animateNumber = (
          el: HTMLElement | null,
          end: number,
          prefix = "",
          formatter: (n: number) => string = (n) => String(Math.round(n))
        ) => {
          if (!el) return
          const obj = { val: 0 }
          anime({
            targets: obj,
            val: end,
            duration: 900,
            easing: "easeOutCubic",
            update: () => {
              el.textContent = `${prefix}${formatter(obj.val)}`
            },
          })
        }
        animateNumber(rankRef.current, me.rank, "#", (n) => `${Math.round(n)}`)
        animateNumber(pointsRef.current, me.entry.totalPoints, "", (n) => formatInt(Math.round(n)))
        animateNumber(feesRef.current, me.entry.totalFees, "", (n) => formatCurrency(n))
      } catch (e) {
        console.warn("[leaderboard] anime import failed", e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [me, participants, progressPercent, progressDotPercent])

  const resolveCaptureBackground = () => {
    if (typeof window === "undefined") return DEFAULT_CAPTURE_BACKGROUND
    try {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor
      if (bodyBg && bodyBg !== "transparent" && bodyBg !== "rgba(0, 0, 0, 0)") {
        return bodyBg
      }
    } catch (error) {
      console.warn("[leaderboard] capture background detection failed", error)
    }
    return DEFAULT_CAPTURE_BACKGROUND
  }

  async function createCaptureBlob() {
    const target = captureRef.current || panelRef.current
    if (!target) return null
    try {
      const htmlToImage = await import("html-to-image")
      const backgroundColor = resolveCaptureBackground()
      return await htmlToImage.toBlob(target, {
        pixelRatio: 2,
        backgroundColor,
        style: {
          backgroundColor,
          background: backgroundColor,
        },
      })
    } catch (error) {
      console.warn("[leaderboard] capture blob failed", error)
      return null
    }
  }

  async function handleSavePng() {
    try {
      const blob = await createCaptureBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const points = me?.entry?.totalPoints ?? 0
      a.download = `ardra-progress-${points}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn("[savePng]", e)
    }
  }

  async function handleShareTwitter() {
    if (shareBusy) return
    setShareBusy(true)

    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const refCode = user?.refCode ?? ""
    const link = refCode ? `${origin}/login?ref=${refCode}` : origin
    const totalPointsValue = me?.entry?.totalPoints ?? 0
    const totalFeesValue = me?.entry?.totalFees ?? 0
    const rank = me?.rank ?? null
    const tierName = tier?.name ?? "Wood"
    const shareCopy = rank
      ? `Ardra leaderboard - ${tierName} tier. Rank #${rank} with ${formatInt(totalPointsValue)} points and $${formatCurrency(totalFeesValue)} in fees.`
      : `Ardra leaderboard - ${tierName} tier. ${formatInt(totalPointsValue)} points in play.`
    const newline = "\n"

    try {
      const blob = await createCaptureBlob()
      if (!blob) throw new Error("Failed to generate share image")
      const file = new File([blob], "ardra-highlight.png", { type: "image/png" })

      const nav: ShareCapableNavigator | undefined =
        typeof navigator !== "undefined" ? (navigator as ShareCapableNavigator) : undefined
      const isMobileShareEnvironment =
        !!nav && ((nav.userAgentData?.mobile ?? false) || /android|iphone|ipad|ipod|mobile/i.test(nav.userAgent || ""))

      if (nav?.share && isMobileShareEnvironment) {
        const canShareFiles = nav.canShare ? nav.canShare({ files: [file] }) : true
        if (canShareFiles) {
          await nav.share({
            files: [file],
            title: "Ardra highlight",
            text: `${shareCopy}${newline}${link}`,
          })
          return
        }
      }

      let helperNote: string | null = null
      if (
        typeof ClipboardItem !== "undefined" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard?.write
      ) {
        try {
          const clipboardItem = new ClipboardItem({ "image/png": blob })
          await navigator.clipboard.write([clipboardItem])
          helperNote = "Imagem copiada. Cole diretamente no tweet."
        } catch (clipboardError) {
          console.warn("[share] clipboard write failed", clipboardError)
        }
      }

      if (!helperNote) {
        try {
          const downloadUrl = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = downloadUrl
          a.download = `ardra-highlight-${totalPointsValue}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(downloadUrl)
          helperNote = "Imagem baixada automaticamente. Anexe-a ao tweet."
        } catch (downloadError) {
          console.warn("[share] download fallback failed", downloadError)
        }
      }

      const tweetUrl = new URL("https://twitter.com/intent/tweet")
      const lines = [shareCopy.trim(), link]
      const tweetBody = lines.join(newline.repeat(2))
      tweetUrl.searchParams.set("text", tweetBody)
      window.open(tweetUrl.toString(), "_blank", "noopener,noreferrer")
    } catch (error) {
      console.warn("[share] web share failed", error)
      const tweetUrl = new URL("https://twitter.com/intent/tweet")
      const tweetBody = `${shareCopy}${newline}${link}`
      tweetUrl.searchParams.set("text", tweetBody)
      window.open(tweetUrl.toString(), "_blank", "noopener,noreferrer")
    } finally {
      setShareBusy(false)
    }
  }
  return (
    <div className="space-y-12">
      <Card className="relative overflow-hidden rounded-[32px] border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_80px_rgba(15,118,110,0.2)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-px rounded-[30px] border border-white/10 opacity-50" aria-hidden />
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-purple-500/20 blur-[140px]" aria-hidden />
        <div ref={panelRef} className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70 backdrop-blur">
                Personalized
              </Badge>
              <h3 className="text-3xl font-semibold text-white md:text-4xl">My info</h3>
              <p className="text-sm text-white/60">Sharing your farming journey. </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void handleShareTwitter()}
                disabled={shareBusy}
                className="h-11 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-6 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(34,211,238,0.35)] transition hover:shadow-[0_18px_40px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {shareBusy ? "Preparing share..." : "Share highlight"}
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleSavePng()}
                className="h-11 rounded-full border-white/30 px-6 text-sm text-white hover:bg-white/10"
              >
                Export card
              </Button>
            </div>
          </div>

          {user && me ? (
            <div
              ref={captureRef}
              className="relative grid gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] via-black/40 to-black/70 p-6 sm:grid-cols-[minmax(0,360px)_1fr] lg:grid-cols-[420px_1fr]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/5 opacity-30" aria-hidden />
              <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" aria-hidden />
              <div className="relative z-10 flex flex-col items-center gap-6 sm:items-center">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_32px_90px_rgba(59,130,246,0.35)] backdrop-blur sm:h-72 sm:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent" />
                  <div className="absolute inset-6 rounded-full border border-white/10" />
                  <Image
                    src={tierArt[currentTierName]}
                    alt={tier?.name ?? "Tier"}
                    priority
                    quality={100}
                    className={cn(
                      "relative h-[88%] w-[88%] object-contain drop-shadow-[0_0_80px_rgba(148,163,233,0.45)]",
                      tierTheme.imageGlow
                    )}
                  />
                </div>
                <div className="flex flex-col items-center gap-2 text-center sm:items-center sm:text-center">
                  <Badge
                    className={cn(
                      "w-fit rounded-full border border-white/20 bg-gradient-to-r px-4 py-1 text-[11px] uppercase tracking-[0.4em] text-white/85 backdrop-blur",
                      tierTheme.accent
                    )}
                  >
                    {currentTierName} tier
                  </Badge>
                  <p className="text-sm text-white/60">{tierTheme.description}</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_38px_rgba(59,130,246,0.08)]">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Rank</span>
                    <p className="mt-3 flex items-baseline gap-2 text-3xl font-semibold text-white">
                      <span ref={rankRef}>#{me.rank}</span>
                      {topPercentLabel != null ? (
                        <span className="rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-white/60">{`Top ${topPercentLabel}%`}</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_38px_rgba(34,211,238,0.12)]">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Players ahead</span>
                    <p className="mt-3 text-3xl font-semibold text-white">{formatInt(playersAhead)}</p>
                    <p className="mt-1 text-xs text-white/45">Edge them out with farming plus referrals.</p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_38px_rgba(251,191,36,0.12)]">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">Referrals</span>
                    <p className="mt-3 text-3xl font-semibold text-white">{formatInt(me.entry.referrals)}</p>
                    <p className="mt-1 text-xs text-white/45">Invite peers to accelerate your climb.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_38px_rgba(56,189,248,0.1)]">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/40">Ardra Points</span>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      <span ref={pointsRef}>{formatInt(me.entry.totalPoints)}</span>
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {formatInt(me.entry.points)} core + {formatInt(me.entry.referralPoints)} network
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_38px_rgba(251,191,36,0.12)]">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/40">Total Fees</span>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      $<span ref={feesRef}>{formatCurrency(me.entry.totalFees)}</span>
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      ${formatCurrency(me.entry.feesGenerated)} self + ${formatCurrency(me.entry.referralFees)} referrals
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-white/45">
                    <span>Tier trajectory</span>
                    {nextTier ? (
                      <span className="rounded-full bg-white/5 px-2 py-1 font-medium text-white/70">
                        {Math.ceil(nextTier.percentGap)}% more
                        {nextTier.playersToPass > 0
                          ? ` - overtake ${formatInt(nextTier.playersToPass)} ${
                              nextTier.playersToPass === 1 ? "player" : "players"
                            }`
                          : " to unlock"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-cyan-500/20 px-2 py-1 font-medium text-cyan-100">Diamond secured</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/15 bg-white/5">
                      <div
                        ref={progressFillRef}
                        className={cn(
                          "absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500",
                          tierTheme.fillGlow
                        )}
                        style={{ width: `${progressWidth}%` }}
                      />
                      <div className="absolute inset-0">
                        {tierBreakpoints.map((bp) => (
                          <div
                            key={bp.name}
                            className={cn(
                              "absolute top-1/2 h-6 w-px -translate-y-1/2 bg-white/15 transition-colors",
                              progressWidth >= bp.cutoff ? "bg-white/40" : undefined
                            )}
                            style={{ left: `${bp.cutoff}%` }}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <div
                        ref={progressDotRef}
                        className="pointer-events-none absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center"
                        style={{ left: `${progressDotPercent}%` }}
                      >
                        <div className="h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white/80 bg-gradient-to-br from-white via-cyan-200 to-transparent" />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px] uppercase tracking-[0.25em] text-white/55">
                      {tierBreakpoints.map((bp) => (
                        <div key={bp.name} className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "font-semibold",
                              currentTierName === bp.name
                                ? "text-white"
                                : progressWidth >= bp.cutoff
                                  ? "text-white/70"
                                  : "text-white/40"
                            )}
                          >
                            {bp.name}
                          </span>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">{bp.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {nextTier ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                    <p className="font-medium text-white">Push for {nextTier.name}</p>
                    <p className="mt-1 leading-relaxed">
                      {nextTier.playersToPass > 0
                        ? `Add ~${Math.ceil(nextTier.percentGap)}% progress or overtake ${formatInt(nextTier.playersToPass)} ${
                            nextTier.playersToPass === 1 ? "player" : "players"
                          } to enter the ${nextTier.name} tier.`
                        : `Add ~${Math.ceil(nextTier.percentGap)}% progress to enter the ${nextTier.name} tier.`}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                    <p className="font-medium text-white">Sustain the apex</p>
                    <p className="mt-1 leading-relaxed">
                      You are already Diamond. Keep activating your network to stay ahead.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-white/70">
              <p className="text-sm">Sign in to unlock the cinematic tier card and broadcast your progress.</p>
              <div className="mt-4 flex justify-center">
                <Button asChild className="h-11 rounded-full bg-cyan-500 px-6 text-black hover:bg-cyan-400">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Airdrop farming leaderboard</h2>
          <p className="text-sm text-white/60">
            Points blend your personal activity with 10% referral fees routed from your network. Climb by farming and by sharing your code.
          </p>
        </div>
        <div className="flex gap-2">
          {user ? (
            <Button asChild variant="outline" className="h-11 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href="/profile">Manage profile</Link>
            </Button>
          ) : (
            <Button asChild className="h-11 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href="/login">Join Ardra</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
          <thead className="text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="py-3 pr-4 pl-6">Rank</th>
              <th className="py-3 pr-4">Member</th>
              <th className="py-3 pr-4">Ref code</th>
              <th className="py-3 pr-4">Total points</th>
              <th className="py-3 pr-4">Fees generated</th>
              <th className="py-3 pr-4">Referral fees</th>
              <th className="py-3 pr-4">Total fees</th>
              <th className="py-3 pr-6">Referrals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-white/50">
                  Loading leaderboard...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-white/50">
                  No members yet. Invite friends and start farming to see your name climb.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr key={entry.id} className={index === 0 ? "bg-white/5" : undefined}>
                  <td className="py-3 pl-6 pr-4 font-mono text-white/70">#{index + 1}</td>
                  <td className="py-3 pr-4 text-white">{entry.name}</td>
                  <td className="py-3 pr-4 font-mono text-cyan-300">{entry.refCode}</td>
                  <td className="py-3 pr-4 text-white">{formatInt(entry.totalPoints)}</td>
                  <td className="py-3 pr-4 text-white/70">${formatCurrency(entry.feesGenerated)}</td>
                  <td className="py-3 pr-4 text-white/60">${formatCurrency(entry.referralFees)}</td>
                  <td className="py-3 pr-4 text-white/60">${formatCurrency(entry.totalFees)}</td>
                  <td className="py-3 pr-6 text-white/60">{entry.referrals}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


