"use client"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const sections = [
  { id: "overview", title: "Overview", summary: "What Ardra is and who it serves." },
  { id: "pillars", title: "Product Pillars", summary: "The guiding principles behind the experience." },
  { id: "automation-stack", title: "Automation Stack", summary: "How bots, control plane, and data flows connect." },
  { id: "command-center", title: "Command Center", summary: "Interfaces, monitoring, and operator controls." },
  { id: "economy", title: "Referral & Points Economy", summary: "Rebates, tiers, and leaderboard mechanics." },
  { id: "data-layer", title: "Data & Identity Layer", summary: "Prisma, Supabase, authentication, and referral capture." },
  { id: "security", title: "Security & Observability", summary: "Custody posture, audit trails, and failure handling." },
  { id: "getting-started", title: "Getting Started", summary: "Checklist to configure Ardra and launch a bot." },
  { id: "faq", title: "FAQ", summary: "Quick answers to recurring questions." },
] as const

const heroHighlights = [
  {
    eyebrow: "Live today",
    title: "Aster bot",
    description: "Smart scalping on Aster DEX now ships via ArdraHubbot on Telegram—no installer, guardrails baked in.",
    glow: "from-cyan-500/50 via-cyan-400/10 to-transparent",
  },
  {
    eyebrow: "Referral flywheel",
    title: "10% + 20%",
    description: "Direct rebates and network shares stack automatically for every pilot and referral.",
    glow: "from-fuchsia-500/50 via-fuchsia-400/10 to-transparent",
  },
  {
    eyebrow: "Data spine",
    title: "Prisma + Supabase",
    description: "Postgres backbone with ingest fallbacks so leaderboard jobs never silently fail.",
    glow: "from-emerald-500/50 via-emerald-400/10 to-transparent",
  },
]

const pillars = [
  {
    title: "Volume-aligned automation",
    description:
      "Bots are tuned for point farming on perpetual DEXs. Strategies are latency-aware, read funding, and rotate through curated symbol sets.",
    gradient: "from-cyan-500/30 via-cyan-400/10 to-transparent",
  },
  {
    title: "Network flywheel",
    description:
      "Referral capture is native. Wallet logins, cookies, and Prisma relations keep every rebate, fee split, and invite mapped to a refCode.",
    gradient: "from-fuchsia-500/30 via-fuchsia-400/10 to-transparent",
  },
  {
    title: "Transparent progression",
    description:
      "The leaderboard packages direct and network points. Operators unlock tiers with clear rules—10% direct rebate, 20% network share, up to 50% for top partners.",
    gradient: "from-emerald-500/30 via-emerald-400/10 to-transparent",
  },
]

const automationLayers = [
  {
    name: "Client-side agents",
    detail:
      "Automation now lives inside ArdraHubbot, our Telegram orchestrator. Pilots trigger runs from chat while guardrails enforce the beta presets.",
    bullets: [
      "Pilots authenticate with `/link` commands; credentials are ingested once and stored encrypted via Prisma before any execution flows.",
      "Margin, take-profit, and stop-loss remain fixed server-side until the configurable editor ships after beta.",
      "Execution, fills, and safeguard alerts stream back through Telegram messages in real time—no dashboard context switch required.",
    ],
  },
  {
    name: "Control plane APIs",
    detail:
      "Next.js App Router exposes REST hooks (`/api/aster/*`, `/api/users/*`) to manage bot lifecycles—start, stop, fetch logs, and sync wallet metadata.",
    bullets: [
      "All routes gate on `auth()` with instant `401` responses for unauthenticated access.",
      "Process orchestration relies on Node's `child_process.spawn` with in-memory log buffers.",
      "Error paths resolve to JSON payloads so the UI can surface precise remedial actions.",
    ],
  },
  {
    name: "Data orchestration",
    detail:
      "Leaderboard ingestion merges on-chain identifiers and spreadsheet uploads. Prisma is the single source of truth with Supabase Postgres underneath.",
    bullets: [
      "Import scripts normalize venue wallet identifiers with referral ownership resolution.",
      "Saved uploads become immutable snapshots (`saveImportedLeaderboard`) for auditability.",
      "Fallback file stores (`lib/user-store.ts`) protect ingest pipelines when the DB is offline.",
    ],
  },
]

const botRoster = [
  {
    name: "Aster",
    status: "Live",
    highlights: [
      "Python strategy orchestrated through `lib/aster-manager`.",
      "Smart scalping presets, funding awareness, and rotation guards.",
      "Runbook: store keys, write config, POST `/api/aster/start` to spawn the session.",
    ],
    glow: "from-cyan-400/50 via-cyan-300/10 to-transparent",
  },
  {
    name: "Hyperliquid",
    status: "Staging",
    highlights: [
      "Latency-optimized connector with point optimizer toggles.",
      "Launch-ready UI cards already published under `/bots/hyperliquid`.",
      "Queueing behind final handler tests for local custody assumptions.",
    ],
    glow: "from-sky-500/50 via-sky-400/10 to-transparent",
  },
  {
    name: "Backpack",
    status: "Staging",
    highlights: [
      "Wallet-exchange blend demands dual session storage.",
      "Config scaffolding mirrors Aster to reuse orchestration tooling.",
      "Compliance checks tracked alongside regulated venue rollout.",
    ],
    glow: "from-violet-500/50 via-violet-400/10 to-transparent",
  },
  {
    name: "ApeX, Pacifica, Paradex, Avantis, StandX, Lighter, OUTKAST",
    status: "In design",
    highlights: [
      "Each bot ships with venue-specific taglines and risk rails already visible on `/bots`.",
      "Playbooks include referral schema, liquidity guards, and margin heuristics.",
      "Ops team maintains parity so switching venues keeps the same control plane.",
    ],
    glow: "from-emerald-500/50 via-emerald-400/10 to-transparent",
  },
]

const rebateModel = [
  {
    label: "Direct rebate — 10%",
    body: "Every trade a pilot executes through Ardra returns 10% of the venue fees. Leaderboard rows expose `feesGenerated` so partners can reconcile externally.",
  },
  {
    label: "Network share — 20%",
    body: "Invites captured by `ReferralCapture` feed Prisma relations (`Referral` model). Points multiply by 0.20 on referred volume and store as `referralFees`.",
  },
  {
    label: "Partner tiers — up to 50%",
    body: "Tier unlock logic lives in the leaderboard importer. Metadata reserves room for future multipliers so DAO votes can adjust shares without refactoring UI.",
  },
]

const quickStart = [
  {
    step: "Create or access an account",
    detail:
      "Connect your Solana wallet with the SIWS flow. `lib/auth.ts` issues the credential and persists every pilot with a generated refCode.",
  },
  {
    step: "Capture referrals (optional)",
    detail:
      "Share `https://www.ardra.xyz/?ref=YOURCODE`. The `ReferralCapture` provider stores the code in cookies/localStorage before sign-up.",
  },
  {
    step: "Launch ArdraHubbot on Telegram",
    detail:
      "Open https://t.me/ArdraHubbot, tap Start, and complete the SIWS handshake so the bot can execute commands for your account.",
  },
  {
    step: "Link bots inside Telegram",
    detail:
      "Use `/link aster`, `/link backpack`, or `/link pacifica` to authorize wallet/API access. ArdraHubbot stores credentials encrypted via Prisma before calling venue APIs.",
  },
  {
    step: "Launch and monitor",
    detail:
      "Send `/run aster` (or the relevant command) to start automation and watch fills, funding cues, and guardrail alerts stream directly into the Telegram chat.",
  },
  {
    step: "Review points and referrals",
    detail:
      "Visit `/leaderboard` or the profile dashboard to monitor `points`, `referralPoints`, and fees in near real time.",
  },
]

const faq = [
  {
    q: "Why does Ardra insist on local custody for bots?",
    a: "Running automation from the pilot's environment keeps API keys and signing devices under user control. The platform only orchestrates processes and never proxies keys through shared infrastructure.",
  },
  {
    q: "How are referrals linked if someone signs up days later?",
    a: "The referral cookie lives for 30 days. On sign-in, `attachReferralIfAny` in `lib/auth.ts` binds the new user to the stored refCode so downstream imports map volume correctly.",
  },
  {
    q: "Can teams audit leaderboard updates?",
    a: "Yes. Import jobs persist raw files, normalize identifiers, and emit snapshots saved through `saveImportedLeaderboard`. Operators can download CSVs for compliance trails.",
  },
  {
    q: "What happens if a bot crashes mid-cycle?",
    a: "Process exits flip the status to `error`, persist the last message, and surface the issue through `/api/aster/status`. The UI prompts for restart after the operator reviews logs.",
  },
]

const cubeFaces = [
  { id: "front", venue: "Aster", image: "/images/vertical/aster.png", blurb: "Latency-tuned scalper that anchors the stack." },
  { id: "back", venue: "Pacifica", image: "/images/vertical/pacifica.png", blurb: "Referral rotation with dual-wallet orchestration." },
  { id: "right", venue: "Backpack", image: "/images/vertical/backpack.png", blurb: "Exchange-grade custody with wallet-native flows." },
  { id: "left", venue: "Hyperliquid", image: "/images/vertical/hyperliquid.png", blurb: "Onchain L1 venue with latency routing." },
  { id: "top", venue: "Avantis", image: "/images/vertical/avantis.png", blurb: "Global leverage surface with zero-fee tiers." },
  { id: "bottom", venue: "ApeX", image: "/images/vertical/apex.png", blurb: "Exchange-native spreads aligned with ApeX tiers." },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const springHover = { type: "spring", stiffness: 320, damping: 26, mass: 0.8 }

export function DocsContent() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.6 })
  const progressOpacity = useTransform(progress, [0, 0.08], [0, 1])

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries
          .filter((item) => item.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]

        if (entry?.target?.id) {
          setActiveSection(entry.target.id)
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    sections.forEach((section) => {
      const el = sectionRefs.current[section.id]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const navigation = useMemo(() => sections, [])

  const SectionWrapper = ({
    id,
    children,
    className,
  }: {
    id: (typeof sections)[number]["id"]
    children: React.ReactNode
    className?: string
  }) => (
    <motion.section
      id={id}
      ref={(el) => {
        sectionRefs.current[id] = el
      }}
      className={cn("scroll-mt-28", className)}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  )

  const AnimatedCard = ({
    children,
    className,
    glow,
  }: {
    children: React.ReactNode
    className?: string
    glow?: string
  }) => (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      transition={springHover}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-white/[0.04] p-6 backdrop-blur",
        className
      )}
    >
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70",
          glow ? `bg-gradient-to-br ${glow}` : "bg-gradient-to-br from-cyan-400/30 via-fuchsia-400/10 to-emerald-400/20"
        )}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <motion.div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400"
        style={{ scaleX: progress, opacity: progressOpacity }}
      />
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 sm:px-8">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-16 z-0 h-[520px] w-[780px] -translate-x-1/2 rounded-full blur-3xl"
          animate={{ rotate: [0, 10, -8, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(circle at 80% 10%, rgba(232,121,249,0.28), transparent 65%)",
          }}
        />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[260px_1fr]">
          <aside className="top-28 hidden self-start lg:sticky lg:block">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
            >
              <div className="text-xs uppercase tracking-[0.4em] text-white/40">On this page</div>
              <nav className="mt-4 space-y-3">
                {navigation.map((section) => {
                  const isActive = section.id === activeSection
                  return (
                    <motion.a
                      key={section.id}
                      href={`#${section.id}`}
                      className={cn(
                        "relative block overflow-hidden rounded-2xl border border-transparent px-4 py-3 text-left transition-colors",
                        isActive ? "text-white" : "text-white/65 hover:text-white"
                      )}
                      whileHover={{ x: 4 }}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="docs-nav-highlight"
                          className="absolute inset-0 rounded-2xl bg-white/[0.08]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                      <span className="relative block text-sm font-medium">{section.title}</span>
                      <span className="relative mt-1 block text-xs text-white/45">{section.summary}</span>
                    </motion.a>
                  )
                })}
              </nav>
            </motion.div>
          </aside>

          <article className="space-y-24">
            <SectionWrapper
              id="overview"
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur sm:p-12"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                animate={{ opacity: [0.65, 0.85, 0.65] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "radial-gradient(75% 90% at 20% 0%, rgba(56,189,248,0.28), transparent 60%), radial-gradient(85% 95% at 80% 10%, rgba(232,121,249,0.18), transparent 65%)",
                }}
              />
              <Badge className="border-cyan-300/40 bg-cyan-500/10 text-cyan-100">Docs</Badge>
              <motion.h1
                className="mt-6 text-4xl font-orbitron text-white sm:text-5xl"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                Ardra automation, crystal clear
              </motion.h1>
              <motion.p
                className="mt-4 max-w-3xl text-base leading-relaxed text-white/70"
                variants={fadeInUp}
                transition={{ duration: 0.65, delay: 0.15 }}
              >
                Ardra is the command center for airdrop farming on perpetual DEXs. Pilots launch venue-specific bots, track funding and slippage, and grow
                referral networks without leaving a single interface. These docs map every layer—from SIWE authentication through the referral economy—so teams
                can scale volume with confidence.
              </motion.p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <AnimatedCard key={item.title} glow={`bg-gradient-to-br ${item.glow}`} className="p-6">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/50">{item.eyebrow}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-xs text-white/60">{item.description}</p>
                  </AnimatedCard>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper id="perp-network">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Interconnected perp DEX orbit</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  Every venue links into Ardra&apos;s control plane. The cube below visualizes the active roster, spinning to show how liquidity, custody, and referrals
                  stay synchronized while pilots rotate strategies between them.
                </p>
              </motion.div>
              <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                <div className="grid gap-4 sm:grid-cols-2">
                  {cubeFaces.map((face) => (
                    <AnimatedCard key={face.id} className="p-5 group/venue">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-white transition-colors duration-300 group-hover/venue:text-cyan-200">
                            {face.venue}
                          </p>
                          <p className="text-xs text-white/55 transition-colors duration-300 group-hover/venue:text-white/80">{face.blurb}</p>
                        </div>
                        <div className="h-px bg-white/10 transition-all duration-300 group-hover/venue:bg-cyan-300/40" />
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
                <div className="relative flex justify-center">
                  <div className="cube-wrapper" aria-hidden="true">
                    <div className="cube">
                      {cubeFaces.map((face) => (
                        <div key={face.id} className={`cube-face cube-face--${face.id}`}>
                          <Image src={face.image} alt={`${face.venue} perp venue`} fill priority sizes="280px" className="object-cover" />
                          <div className="cube-face__label">
                            <span>{face.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cube-orbit" />
                  </div>
                </div>
              </div>
              <style jsx>{`
                .cube-wrapper {
                  --cube-size: clamp(220px, 28vw, 320px);
                  width: var(--cube-size);
                  height: var(--cube-size);
                  perspective: 1400px;
                  display: grid;
                  place-items: center;
                  position: relative;
                }

                .cube {
                  width: var(--cube-size);
                  height: var(--cube-size);
                  position: relative;
                  transform-style: preserve-3d;
                  animation: cube-spin 16s linear infinite;
                }

                .cube-face {
                  position: absolute;
                  inset: 0;
                  border-radius: 1.5rem;
                  overflow: hidden;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  box-shadow: 0 0 30px rgba(34, 211, 238, 0.18);
                  display: flex;
                  align-items: flex-end;
                  justify-content: center;
                  background: rgba(2, 6, 23, 0.85);
                  transform-style: preserve-3d;
                }

                .cube-face__label {
                  position: absolute;
                  bottom: 12px;
                  padding: 6px 14px;
                  border-radius: 999px;
                  background: rgba(6, 182, 212, 0.22);
                  border: 1px solid rgba(255, 255, 255, 0.22);
                  font-size: 0.7rem;
                  text-transform: uppercase;
                  letter-spacing: 0.28em;
                  color: rgba(255, 255, 255, 0.92);
                  backdrop-filter: blur(8px);
                }

                .cube-face--front { transform: translateZ(calc(var(--cube-size) / 2)); }
                .cube-face--back { transform: rotateY(180deg) translateZ(calc(var(--cube-size) / 2)); }
                .cube-face--right { transform: rotateY(90deg) translateZ(calc(var(--cube-size) / 2)); }
                .cube-face--left { transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2)); }
                .cube-face--top { transform: rotateX(90deg) translateZ(calc(var(--cube-size) / 2)); }
                .cube-face--bottom { transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2)); }

                .cube-orbit {
                  position: absolute;
                  inset: 12%;
                  border-radius: 999px;
                  border: 1px dashed rgba(148, 163, 184, 0.18);
                  animation: orbit-glow 8s ease-in-out infinite;
                }

                @keyframes cube-spin {
                  0% { transform: rotateX(0deg) rotateY(0deg); }
                  25% { transform: rotateX(90deg) rotateY(90deg); }
                  50% { transform: rotateX(180deg) rotateY(180deg); }
                  75% { transform: rotateX(270deg) rotateY(270deg); }
                  100% { transform: rotateX(360deg) rotateY(360deg); }
                }

                @keyframes orbit-glow {
                  0%, 100% { opacity: 0.35; transform: scale(1); }
                  50% { opacity: 0.7; transform: scale(1.06); }
                }

                @media (max-width: 768px) {
                  .cube-wrapper { --cube-size: 200px; }
                }
              `}</style>
            </SectionWrapper>
            <SectionWrapper id="pillars">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Product pillars</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  The experience is built around three non-negotiables: automation that genuinely models venue incentives, a referral engine stitched into every
                  flow, and visible progression toward airdrops and partner rewards.
                </p>
              </motion.div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {pillars.map((pillar) => (
                  <AnimatedCard key={pillar.title} glow={`bg-gradient-to-br ${pillar.gradient}`} className="p-6">
                    <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                    <p className="mt-3 text-sm text-white/70">{pillar.description}</p>
                  </AnimatedCard>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper id="automation-stack">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Automation stack</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  Ardra links local agents, Next.js APIs, and ingestion utilities. The breakdown below shows responsibilities per layer so teams know where to extend or plug in.
                </p>
              </motion.div>
              <div className="mt-8 grid gap-6">
                {automationLayers.map((layer) => (
                  <AnimatedCard key={layer.name} className="p-7">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="text-2xl font-semibold text-white">{layer.name}</h3>
                      <Badge className="border-white/15 bg-white/10 text-white/70 uppercase tracking-[0.3em]">Layer</Badge>
                    </div>
                    <p className="mt-3 text-sm text-white/70">{layer.detail}</p>
                    <ul className="mt-4 space-y-2 text-sm text-white/60">
                      {layer.bullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400/80" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedCard>
                ))}
              </div>
              <motion.div variants={fadeInUp} transition={{ duration: 0.65 }} className="mt-10 grid gap-4 md:grid-cols-2">
                {botRoster.map((bot) => (
                  <AnimatedCard key={bot.name} glow={`bg-gradient-to-br ${bot.glow}`} className="p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">{bot.name}</h4>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">{bot.status}</span>
                    </div>
                    <ul className="mt-3 space-y-2 text-xs text-white/65">
                      {bot.highlights.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="mt-1 h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedCard>
                ))}
              </motion.div>
            </SectionWrapper>

            <SectionWrapper id="command-center">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Command center</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  The command center is the pilot&apos;s bridge. It exposes API-backed controls and real-time UI states so operators can configure bots, launch sessions, and inspect telemetry without leaving the dashboard.
                </p>
              </motion.div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Configuration workspace</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li>Wallet inventory stored in `profileWallets` and exposed through `/api/users/wallets`.</li>
                    <li>Strategy presets saved on disk via `writeUserConfig`, keeping API secrets off the cloud.</li>
                    <li>Form state mirrors diffed configs so operators know what changed before relaunching.</li>
                  </ul>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Runtime observability</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li>Session heartbeat endpoints (`/api/aster/status`) report PID, uptime, and last error.</li>
                    <li>Log buffers stream the final 1,000 lines per user so troubleshooting stays contextual.</li>
                    <li>UI cards animate with Anime.js to highlight state changes the moment they land.</li>
                  </ul>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Operational safeguards</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li>Start requests validate config existence, blocking accidental launches without keys.</li>
                    <li>Stop commands always fire, even if the process already exited, guaranteeing cleanup.</li>
                    <li>Login logs recorded via Prisma provide a tamper-evident audit for every auth method.</li>
                  </ul>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Ecosystem visibility</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li>Leaderboard entries include referrer and referred codes for multi-hop attribution.</li>
                    <li>Partner filters (soon) let DAOs slice data by community or campaign.</li>
                    <li>Exports align with spreadsheet imports to reconcile incentives on both sides.</li>
                  </ul>
                </AnimatedCard>
              </div>
            </SectionWrapper>

            <SectionWrapper id="economy">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Referral & points economy</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  Ardra&apos;s economics reward execution and network growth simultaneously. The logic used on the marketing site is the same logic that powers the leaderboard and partner dashboards.
                </p>
              </motion.div>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {rebateModel.map((item) => (
                  <AnimatedCard key={item.label}>
                    <div className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</div>
                    <p className="mt-3 text-sm text-white/70">{item.body}</p>
                  </AnimatedCard>
                ))}
              </div>
              <AnimatedCard className="mt-8 p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-white/40">Data flow</div>
                <p className="mt-3 text-sm text-white/65">
                  1) Referral codes originate from `ensureUserRefCode` and attach on login. 2) Volume imports reference wallet identifiers, reconcile them with owner refCodes, and compute point totals. 3) The leaderboard API serves aggregated rows with `points`, `feesGenerated`, and `referralPoints`, enabling instant UI updates and CSV exports.
                </p>
              </AnimatedCard>
            </SectionWrapper>

            <SectionWrapper id="data-layer">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Data & identity layer</h2>
              </motion.div>
              <div className="mt-4 space-y-4 text-sm text-white/70">
                <p>
                  Ardra uses Prisma as the abstraction over a Supabase-hosted Postgres cluster. Authentication runs through NextAuth with a Solana Sign-In workflow (SIWS); pilots verify ownership of their wallet and every session gets recorded with IP, user agent, and method metadata for auditability.
                </p>
                <p>
                  Wallet addresses persist in the `Wallet` table with chain metadata, while `Referral` relations bind referrers and referees. Production traffic stores Solana addresses exclusively, and SIWS nonces live in the `SiweNonce` table to block replay attacks. The application reuses the same Prisma client across requests (`lib/prisma.ts`) to avoid connection churn.
                </p>
                <p>
                  When the database is unreachable, the ingest layer falls back to JSON snapshots (`lib/user-store.ts`) so leaderboard updates never silently fail. Once connectivity returns, data merges back into Postgres without duplicating refCodes.
                </p>
              </div>
              <AnimatedCard className="mt-6">
                <h3 className="text-lg font-semibold text-white">Key models</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/65">
                  <li>
                    <strong>User</strong>: canonical profile with optional username, referral code, and wallet JSON snapshot.
                  </li>
                  <li>
                    <strong>Wallet</strong>: chain-specific address records with custody metadata.
                  </li>
                  <li>
                    <strong>Referral</strong>: directed edges mapping referrer → referred for payouts.
                  </li>
                  <li>
                    <strong>LoginLog</strong>: append-only audit trail capturing every authentication attempt.
                  </li>
                  <li>
                    <strong>SiweNonce</strong>: expiring records that secure Solana signature flows.
                  </li>
                </ul>
              </AnimatedCard>
            </SectionWrapper>

            <SectionWrapper id="security">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Security & observability</h2>
              </motion.div>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Custody posture</h3>
                  <p className="mt-3 text-sm text-white/65">
                    Credentials captured through ArdraHubbot stay encrypted via Prisma before any venue call executes. Decryption happens in-memory per request, nothing is written to disk, and raw API keys never leave secured storage.
                  </p>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Audit events</h3>
                  <p className="mt-3 text-sm text-white/65">
                    `createLoginLog` records every authentication attempt with IP and user agent via Next headers. The data informs breach monitoring and helps partners diagnose suspicious access.
                  </p>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Error recovery</h3>
                  <p className="mt-3 text-sm text-white/65">
                    Spawned processes capture stderr prefixed with `[err]`, making triage easier. Status endpoints flip to `error` and show the last message so operators know whether retries are safe.
                  </p>
                </AnimatedCard>
                <AnimatedCard>
                  <h3 className="text-xl font-semibold text-white">Rate & session control</h3>
                  <p className="mt-3 text-sm text-white/65">
                    NextAuth issues JWT sessions with short TTLs. Sensitive routes disable caching (
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">cache: &quot;no-store&quot;</code>) to eliminate stale responses. Referral cookies sanitize inputs and uppercase refCodes before storage.
                  </p>
                </AnimatedCard>
              </div>
            </SectionWrapper>

            <SectionWrapper id="getting-started">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">Getting started</h2>
                <p className="mt-3 max-w-3xl text-sm text-white/65">
                  Ready to pilot Ardra? Follow the checklist below. Each item links back to the platform so you can jump straight in.
                </p>
              </motion.div>
              <ol className="mt-6 space-y-4 text-sm text-white/70">
                {quickStart.map((item, index) => (
                  <AnimatedCard key={item.step} className="p-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-lg font-semibold text-white">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="text-base font-semibold text-white">{item.step}</div>
                        <p className="mt-2 text-sm text-white/65">{item.detail}</p>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  { href: "/login", label: "Sign in to Ardra" },
                  { href: "/bots", label: "Explore bots" },
                  { href: "/leaderboard", label: "Check leaderboard" },
                ].map((cta) => (
                  <motion.div key={cta.href} whileHover={{ y: -4 }} transition={springHover}>
                    <Link
                      href={cta.href}
                      className={cn(
                        "inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium transition",
                        cta.href === "/login"
                          ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                          : "bg-white/10 text-white hover:bg-white/15"
                      )}
                    >
                      {cta.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper id="faq">
              <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl font-orbitron text-white">FAQ</h2>
              </motion.div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {faq.map((item) => (
                  <AnimatedCard key={item.q} className="p-6">
                    <h3 className="text-lg font-semibold text-white">{item.q}</h3>
                    <p className="mt-3 text-sm text-white/65">{item.a}</p>
                  </AnimatedCard>
                ))}
              </div>
            </SectionWrapper>

          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
