"use client"

import { useEffect, useRef } from "react"

import { animate, createTimeline, stagger } from "animejs"

const pillars = [
  {
    title: "Bots built for volume",
    body: "Low‑latency strategies tuned per Perp DEX so every fill turns into points and tier progression.",
    accent: "from-cyan-500/40 via-cyan-400/10 to-transparent",
  },
  {
    title: "Referral flywheel",
    body: "Traders and communities plug in once, earn 10% direct fee rebates, and grow the network.",
    accent: "from-fuchsia-500/40 via-fuchsia-400/10 to-transparent",
  },
  {
    title: "Native leaderboard",
    body: "Every trade and referral earns Ardra Points and pushes you up for the future airdrop.",
    accent: "from-emerald-500/40 via-emerald-400/10 to-transparent",
  },
]

export function MissionSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      const section = sectionRef.current
      const cards = cardsRef.current.filter(Boolean)
      if (!section || cards.length === 0) return

      // Set initial state
      animate(section, { opacity: 0, translateY: 40, duration: 0 })
      animate(cards as any, { opacity: 0, translateY: 24, duration: 0 })

      const timeline = createTimeline({ autoplay: false })
        .add(
          section,
          {
            opacity: [0, 1],
            translateY: [40, 0],
            ease: "outQuad",
            duration: 600,
          }
        )
        .add(
          cards as any,
          {
            opacity: [0, 1],
            translateY: [24, 0],
            ease: "outExpo",
            duration: 700,
            delay: stagger(120),
          },
          "-=200"
        )

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              timeline.play()
              observer.disconnect()
            }
          })
        },
        { threshold: 0.25 }
      )

      observer.observe(section)
      cleanup = () => observer.disconnect()
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto mt-24 max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.02] px-8 py-16 text-white sm:px-12"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-emerald-400/10 blur-3xl" />
      </div>
      <p className="text-sm uppercase tracking-[0.4em] text-white/40">Why Ardra</p>
      <h2 className="mt-4 max-w-2xl text-3xl font-orbitron text-white sm:text-4xl">
        Automation that connects volume, rebates, and points in a single loop
      </h2>
      <p className="mt-4 max-w-3xl text-base text-white/70">
        Ardra turns activity farming into a professional operation: purpose‑built bots, an intelligent affiliate program,
        and transparent gamification with the leaderboard.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, idx) => (
          <div
            key={pillar.title}
            ref={(el) => {
              cardsRef.current[idx] = el
            }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          >
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${pillar.accent}`} />
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">{String(idx + 1).padStart(2, "0")}</div>
            <h3 className="mt-4 text-xl font-semibold text-white">{pillar.title}</h3>
            <p className="mt-3 text-sm text-white/70">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
