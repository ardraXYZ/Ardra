"use client"

import { useEffect, useRef } from "react"

import { animate, stagger } from "animejs"

const steps = [
  {
    title: "Connect and configure",
    description: "Pick the Perp DEX, add wallets, and set limits. Everything is saved in the command center.",
    detail: "Rolling compatibility with Aster, Backpack, Hyperliquid, Apex, and upcoming integrations.",
  },
  {
    title: "Execute intelligently",
    description: "Bots analyze liquidity, funding, and spread to prioritize trades that generate real volume.",
    detail: "Each strategy has auditable guard rails and a monitored heartbeat.",
  },
  {
    title: "Multiply your network",
    description: "Share your link. Earn 10% on your own trades and 20% from referred volume across venues.",
    detail: "Your invitees join with tracking—no complex setup required.",
  },
  {
    title: "Climb to the top",
    description: "Own volume + network = Ardra Points. Rise on the leaderboard and unlock tiers up to 50%.",
    detail: "Points will be the criteria for the airdrop and future perks.",
  },
]

export function ExecutionFlowSection() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      const container = containerRef.current
      const stepsElements = stepRefs.current.filter(Boolean)
      if (!container || stepsElements.length === 0) return

      // Set initial state
      animate(stepsElements as any, { opacity: 0, translateY: 30, duration: 0 })

      const animation = animate(
        stepsElements as any,
        {
          opacity: [0, 1],
          translateY: [30, 0],
          ease: "outQuint",
          duration: 600,
          delay: stagger(150),
          autoplay: false,
        }
      )

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animation.play()
              observer.disconnect()
            }
          })
        },
        { threshold: 0.2 }
      )

      observer.observe(container)
      cleanup = () => observer.disconnect()
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="mx-auto mt-24 max-w-6xl px-6 text-white sm:px-8"
    >
      <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.03] p-8 sm:p-12">
        <p className="text-sm uppercase tracking-[0.4em] text-white/40">How it works</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr] md:items-start">
          <div>
            <h2 className="text-3xl font-orbitron text-white sm:text-4xl">
              Grow volume and points in four guided steps
            </h2>
            <p className="mt-4 text-base text-white/70">
              From onboarding to rebate splits, every step is designed for partners, traders, and communities to operate with
              transparency and scale.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-[14px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-cyan-400/60 via-fuchsia-400/40 to-emerald-400/60" />
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  ref={(el) => {
                    stepRefs.current[index] = el
                  }}
                  className="relative rounded-2xl border border-white/10 bg-black/40 p-6 pl-12"
                >
                  <div className="absolute left-0 top-6 grid h-8 w-8 place-items-center rounded-full border border-white/40 bg-black text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{step.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/40">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
