"use client"

import { useEffect, useRef } from "react"

import { animate, stagger } from "animejs"

const modules = [
  {
    name: "Aster",
    status: "Live",
    metrics: ["Smart scalping", "Funding aware", "Referral tracking"],
  },
  {
    name: "Backpack",
    status: "Soon",
    metrics: ["Omni cycle", "Liquidity guards", "Auto-withdraw"],
  },
  {
    name: "Hyperliquid",
    status: "Soon",
    metrics: ["Latency routing", "Point optimizer", "Volume scheduler"],
  },
  {
    name: "Apex",
    status: "Soon",
    metrics: ["Omni spread", "Auto tier tracking", "Multi-market sweeps"],
  },
]

const highlights = [
  {
    title: "User‑controlled custody",
    body: "Bots run directly in the browser with auditable extensions. You control keys, limits, and pauses.",
  },
  {
    title: "Live monitoring",
    body: "Real‑time dashboard with funding, slippage alerts, and point progress per venue.",
  },
  {
    title: "Ready‑made playbooks",
    body: "Presets for scalping, delta‑neutral rotations, and liquidity events, ready to enable in one click.",
  },
]

export function CommandCenterSection() {
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([])
  const highlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      const modulesElements = moduleRefs.current.filter(Boolean)
      const highlight = highlightRef.current
      if (modulesElements.length === 0 || !highlight) return

      // Set initial state
      animate(modulesElements as any, { opacity: 0, translateY: 20, duration: 0 })
      animate(highlight, { opacity: 0, translateY: 35, duration: 0 })

      const moduleAnim = animate(
        modulesElements as any,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          ease: "outSine",
          duration: 500,
          delay: stagger(120),
          autoplay: false,
        }
      )

      const highlightAnim = animate(
        highlight,
        {
          opacity: [0, 1],
          translateY: [35, 0],
          ease: "outExpo",
          duration: 650,
          autoplay: false,
        }
      )

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              moduleAnim.play()
              highlightAnim.play()
              observer.disconnect()
            }
          })
        },
        { threshold: 0.25 }
      )

      observer.observe(modulesElements[0] as Element)
      cleanup = () => observer.disconnect()
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6 text-white sm:px-8">
      <div className="grid items-stretch gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 p-8">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(20,184,166,0.15),transparent_45%),linear-gradient(315deg,rgba(56,189,248,0.18),transparent_45%)]" />
          <p className="text-sm uppercase tracking-[0.4em] text-white/40">Command center</p>
          <h2 className="mt-4 text-3xl font-orbitron text-white sm:text-4xl">Centralized orchestration across venues</h2>
          <p className="mt-4 text-base text-white/70">
            Track active bots, integration status, and critical metrics without juggling multiple panels. Everything lives
            in Ardra’s interface with updates in seconds.
          </p>
          <div className="mt-8 space-y-4">
            {modules.map((module, index) => (
              <div
                key={module.name}
                ref={(el) => {
                  moduleRefs.current[index] = el
                }}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-5 py-4"
              >
                <div>
                  <div className="text-lg font-semibold text-white">{module.name}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
                    {module.metrics.map((metric) => (
                      <span key={metric} className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em]">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                  {module.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={highlightRef}
          className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">Operational stack</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">Reliable infrastructure to farm points</h3>
          </div>
          <div className="space-y-6">
            {highlights.map((highlight) => (
              <div key={highlight.title} className="rounded-xl border border-white/10 bg-black/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-white/50">{highlight.title}</div>
                <p className="mt-3 text-sm text-white/70">{highlight.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-xs uppercase tracking-[0.3em] text-cyan-200">
            Auditable logs, real‑time monitoring, and metrics export for DAO or community reports.
          </div>
        </div>
      </div>
    </section>
  )
}
