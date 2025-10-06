"use client"

import { useEffect, useRef } from "react"

import { animate, stagger } from "animejs"
import { Badge } from "@/components/ui/badge"

const rewardBlocks = [
  {
    label: "Direct rebate",
    percentage: "10%",
    description: "Each executed trade redirects 10% of the fees earned by Ardra to you.",
  },
  {
    label: "Referral network",
    percentage: "20%",
    description: "Invite traders, creators, or communities and receive 20% of the fees they generate.",
  },
  {
    label: "Partner tier",
    percentage: "Up to 50%",
    description: "Hit volume and retention goals to unlock tiers with up to half of fees shared.",
  },
]

export function EconomicsSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean)
    if (cards.length === 0) return

    // Set initial state for card animation
    animate(cards as any, { opacity: 0, translateY: 24, duration: 0 })

    const cardsAnim = animate(
      cards as any,
      {
        opacity: [0, 1],
        translateY: [24, 0],
        ease: "outQuad",
        duration: 500,
        delay: stagger(140),
        autoplay: false,
      }
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cardsAnim.play()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(cards[0] as Element)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6 text-white sm:px-8">
      <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/5 via-black to-black p-8 sm:p-12">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.4em] text-white/40">Rebate economics</p>
          <h2 className="mt-4 text-3xl font-orbitron text-white sm:text-4xl">
            Transparent split: rebate fees, shared network, partner tier
          </h2>
          <p className="mt-4 text-base text-white/70">
            We apply the same logic across each DEX: volume generated with the bots returns to you and your team with clear
            distribution rules-no spreadsheets.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {rewardBlocks.map((block, index) => (
            <div
              key={block.label}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className="flex h-full flex-col gap-6 rounded-2xl border border-white/15 bg-white/[0.05] p-6 backdrop-blur"
            >
              <Badge className="w-fit border-white/20 bg-white/10 text-xs uppercase tracking-[0.3em] text-white/70">
                {block.label}
              </Badge>
              <div className="text-4xl font-semibold text-white">{block.percentage}</div>
              <p className="text-sm text-white/65">{block.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
