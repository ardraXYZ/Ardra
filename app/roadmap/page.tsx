import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"

type PhaseStatus = "live" | "building" | "planned"

const roadmapPhases: {
  id: string
  phase: string
  period: string
  status: PhaseStatus
  summary: string
  milestones: { title: string; detail: string }[]
}[] = [
  {
    id: "phase-1",
    phase: "Phase 01",
    period: "Q3 - 2025",
    status: "live",
    summary:
      "Ardra blueprint finalized, MVP assembled and the first public surfaces (site, leaderboard and desktop bot) released for early pilots.",
    milestones: [
      { title: "Vision & research", detail: "Documented the automation thesis and operating blueprint." },
      { title: "Website + leaderboard v1", detail: "Shipped the first public portal for stats and onboarding." },
      { title: "Desktop bot", detail: "Released the .exe automation agent for Windows pilots." },
    ],
  },
  {
    id: "phase-2",
    phase: "Phase 02",
    period: "Q4 - 2025",
    status: "building",
    summary:
      "Website 2.0, refreshed leaderboard and Telegram-based bot control go live, while aggressive marketing cycles and partner deals kick off this quarter.",
    milestones: [
      { title: "Website 2.0", detail: "New design, improved storytelling and performance." },
      { title: "Telegram bot", detail: "Migrated automation flows from desktop to chat." },
      { title: "Growth loops", detail: "Launch marketing pushes and strategic partnerships." },
    ],
  },
  {
    id: "phase-3",
    phase: "Phase 03",
    period: "Q1-Q2 - 2026",
    status: "planned",
    summary:
      "Launch the web-based bot with customizable strategies, expand Perp DEX coverage and turn Ardra into a growth engine with token-driven decentralization.",
    milestones: [
      { title: "Web bot", detail: "Browser-native automation hub with strategy builder." },
      { title: "DEX expansion", detail: "Add more Perp DEX partners with deeper integrations." },
      { title: "Token launch", detail: "Kick off decentralization and align incentives via Ardra token." },
    ],
  },
  {
    id: "phase-4",
    phase: "Phase 04",
    period: "Q3-Q4 - 2026",
    status: "planned",
    summary:
      "Turn telemetry into a liquidity flywheel: deeper partner integrations, expanded rewards and orchestrated marketing alliances.",
    milestones: [
      { title: "Points system 2.0", detail: "New scoring logic powering referrals and incentives." },
      { title: "Stake + buybacks", detail: "Introduce staking sinks and buyback mechanics for the token." },
      { title: "Referral expansion", detail: "Extend referral rails beyond Perp DEX niches." },
    ],
  },
  {
    id: "phase-5",
    phase: "Phase 05",
    period: "2027+",
    status: "planned",
    summary:
      "Ardra evolves into a self-sustaining network: smarter automation rails plus social communities where KOLs showcase performance, rebates and airdrop value to their squads.",
    milestones: [
      { title: "System refinement", detail: "Continuous evolution of automation rails and safety tooling." },
      { title: "Creator communities", detail: "Social layer where KOL squads share rebates, points and airdrop wins." },
      { title: "Rewards transparency", detail: "Dashboards for rebates, prize pools and accumulated airdrops." },
    ],
  },
]

const statusCopy: Record<PhaseStatus, string> = {
  live: "Live",
  building: "Building",
  planned: "Planned",
}

const statusStyles: Record<PhaseStatus, string> = {
  live: "border-emerald-400/30 text-emerald-200",
  building: "border-cyan-300/30 text-cyan-200",
  planned: "border-white/20 text-white/70",
}

const statusDotColors: Record<PhaseStatus, string> = {
  live: "border-emerald-300/90 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.55)]",
  building: "border-cyan-300/90 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.45)]",
  planned: "border-white/30 text-white/70",
}

const statusDotHalo: Record<PhaseStatus, string> = {
  live: "bg-emerald-400/40",
  building: "bg-cyan-400/40",
  planned: "bg-white/40",
}

const statusCardGlow: Record<PhaseStatus, string> = {
  live: "from-emerald-400/15 via-transparent to-transparent",
  building: "from-cyan-400/20 via-transparent to-transparent",
  planned: "from-white/5 via-transparent to-transparent",
}

export const revalidate = 0
export const dynamic = "force-dynamic"

export default function RoadmapPage() {
  const totalPhases = roadmapPhases.length
  const highestActiveIndex = roadmapPhases.reduce((acc, phase, index) => {
    return phase.status === "planned" ? acc : index
  }, 0)
  const progressPercent = totalPhases > 1
    ? Math.min(100, Math.max(0, ((highestActiveIndex + 0.5) / (totalPhases - 1)) * 100))
    : 100

  return (
    <div className="min-h-[100svh] bg-[#05040f] text-white relative isolate overflow-x-clip">
      <SiteHeader />

      {/* Shared hero background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero-grid opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),_transparent_55%),radial-gradient(circle_at_center,_rgba(15,23,42,0.85),_transparent_70%)]" />
        <div className="pointer-events-none absolute -top-32 left-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[140px]" />
        <div className="pointer-events-none absolute -top-16 right-8 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-emerald-400/15 blur-[140px]" />
      </div>

      <main className="pt-32 pb-20 space-y-10">
        <section className="site-wrap mx-auto">
          <div className="frame frame--cta-middle relative overflow-hidden px-4 py-10 sm:px-8">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="relative space-y-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Timeline</p>
                <h2 className="font-orbitron text-3xl text-glow">Roadmap</h2>
              </div>

              <div className="relative mt-10 space-y-12">
                <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full -translate-x-1/2 md:block">
                  <div className="relative h-full w-2 overflow-hidden rounded-full bg-white/12">
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-emerald-400/80 via-cyan-300/60 to-fuchsia-400/50 shadow-[0_0_35px_rgba(34,211,238,0.35)]"
                      style={{ height: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {roadmapPhases.map((phase, index) => {
                  const isLeft = index % 2 === 0
                  const formattedIndex = String(index + 1).padStart(2, "0")
                  const isPhaseActive = index <= highestActiveIndex

                  const card = (
                    <div className="group/card relative rounded-2xl bg-gradient-to-r from-emerald-400/20 via-cyan-300/15 to-fuchsia-400/20 p-[1.5px] transition duration-300 hover:-translate-y-1 hover:from-emerald-400/35 hover:via-cyan-300/25 hover:to-fuchsia-400/35 focus-within:from-emerald-400/35 focus-within:via-cyan-300/25 focus-within:to-fuchsia-400/35">
                      <article
                        tabIndex={0}
                        className="relative rounded-[calc(theme(borderRadius.2xl)-3px)] border border-white/25 bg-white/[0.02] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 group-hover/card:border-transparent group-hover/card:shadow-[0_0_25px_rgba(34,211,238,0.25)] focus-visible:outline-none"
                      >
                        <div
                          className={cn(
                            "pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r",
                            statusCardGlow[phase.status]
                          )}
                          aria-hidden
                        />

                        <div className="mb-3 flex items-center gap-3 md:hidden">
                          <div
                            className={cn(
                              "relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-[#05040f] font-orbitron text-[0.9rem] tracking-[0.2em]",
                              statusDotColors[phase.status]
                            )}
                          >
                            <span>{formattedIndex}</span>
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-3 py-0.5 text-[11px] uppercase tracking-[0.35em]",
                              statusStyles[phase.status]
                            )}
                          >
                            {statusCopy[phase.status]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/50">
                          <span>{phase.period}</span>
                          <span
                            className={cn(
                              "hidden rounded-full border px-3 py-0.5 md:inline-flex",
                              statusStyles[phase.status]
                            )}
                          >
                            {statusCopy[phase.status]}
                          </span>
                        </div>
                        <h3 className="mt-4 font-orbitron text-xl text-white">{phase.phase}</h3>
                        <p className="mt-2 text-sm text-white/70">{phase.summary}</p>
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                          {phase.milestones.map((milestone) => (
                            <li key={milestone.title} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                              <span>
                                <span className="text-white">{milestone.title}</span>: {milestone.detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  )

                  const connectorColor = isPhaseActive
                    ? isLeft
                      ? "bg-gradient-to-l from-emerald-400 via-cyan-300 to-fuchsia-400 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                      : "bg-gradient-to-r from-emerald-400 via-cyan-300 to-fuchsia-400 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "bg-white/15"

                  return (
                    <div
                      key={phase.id}
                      className="relative grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
                    >
                      <div
                        className={cn(
                          "relative w-full md:max-w-md",
                          isLeft
                            ? "md:col-start-1 md:justify-self-end md:pr-16"
                            : "md:col-start-3 md:justify-self-start md:pl-16",
                          "col-span-1"
                        )}
                      >
                        {card}
                      </div>

                      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                        <div
                          className={cn(
                            "relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#05040f] font-orbitron text-sm tracking-[0.2em] text-white",
                            statusDotColors[phase.status]
                          )}
                        >
                          <span>{formattedIndex}</span>
                          <span
                            className={cn(
                              "pointer-events-none absolute -inset-4 -z-10 rounded-full blur-3xl",
                              statusDotHalo[phase.status]
                            )}
                            aria-hidden
                          />
                          <span
                            className={cn(
                              "absolute top-1/2 h-px w-12 -translate-y-1/2",
                              isLeft ? "right-full mr-4" : "left-full ml-4",
                              connectorColor
                            )}
                            aria-hidden
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
