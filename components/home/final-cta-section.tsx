"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

import { animate } from "animejs"
import { Button } from "@/components/ui/button"

const affiliateFormUrl = "https://forms.gle/6h4ZonFJvFzwGccU9"

export function FinalCtaSection() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      const element = containerRef.current
      if (!element) return

      const animation = animate(
        element,
        {
          opacity: [0, 1],
          scale: [0.96, 1],
          ease: "outExpo",
          duration: 700,
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
        { threshold: 0.4 }
      )

      observer.observe(element)
      cleanup = () => observer.disconnect()
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <section className="mx-auto mt-24 max-w-5xl px-6 sm:px-8">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/80 px-10 py-14 text-center text-white"
        style={{ opacity: 0 }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),transparent_60%)]" />
        <div className="text-sm uppercase tracking-[0.5em] text-white/40">Affiliate program</div>
        <h2 className="mt-4 text-3xl font-orbitron sm:text-4xl">
          Ready to run your community with Ardra
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
          Join the Ardra affiliate program to unlock physical merch bundles for your community giveaways and earn up to 50% of referral fees - recruit traders, scale volume, grow your team
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-6">
            <h3 className="text-base font-semibold text-white">Physical drops</h3>
            <p className="mt-2 text-sm text-white/65">
              Secure exclusive merch to raffle with your community and amplify your launches.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-6">
            <h3 className="text-base font-semibold text-white">Up to 50% referral fees</h3>
            <p className="mt-2 text-sm text-white/65">
              Stack Ardra tiers to capture as much as half of the fees your network generates across supported DEXs.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400">
            <Link href={affiliateFormUrl} target="_blank" rel="noopener noreferrer">
              Apply to the affiliate program
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/leaderboard">View leaderboard</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}





