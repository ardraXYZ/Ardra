"use client"

import { useEffect } from "react"
import { animate, utils } from "animejs"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  useEffect(() => {
    try {
      animate(".hero-badge", {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 500,
        ease: "outExpo",
      })

      animate(".hero-title", {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        delay: 100,
        ease: "outExpo",
      })

      animate(".hero-subtitle", {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        delay: 200,
        ease: "outExpo",
      })

      animate(".hero-cta", {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 600,
        delay: 350,
        ease: "outExpo",
      })

      animate(".orb", {
        scale: [0.95, 1.05],
        duration: 4000,
        ease: "inOutSine",
        loop: true,
        alternate: true,
      })
    } catch (e) {
      console.error("Anime init failed:", e)
    }

    return () => {
      try { utils.remove(".orb") } catch {}
    }
  }, [])

  return (
    <section className="relative isolate">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 bg-hero-grid opacity-20" />

        {/* Aurora / glows */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl orb" />
        <div className="pointer-events-none absolute top-40 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl orb" />
        <div className="pointer-events-none absolute bottom-20 left-1/3 h-60 w-60 sm:bottom-28 sm:h-64 sm:w-64 rounded-full bg-emerald-400/20 blur-3xl orb" />

        {/* Subtle radial vignette */}
        <div className="absolute inset-0 radial-mask" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-40 pb-16 sm:pt-44 sm:pb-20">
        <div className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_theme(colors.cyan.400)]" />
          Live - Airdrop Automation
        </div>

        <h1 className="hero-title font-orbitron text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white text-glow">
          Ardra
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
            Perp DEX Farm Automation
          </span>
        </h1>

        <p className="hero-subtitle mt-6 max-w-2xl text-base sm:text-lg text-white/70">
          Farm smarter, rank higher. Run trading bots to grow your PerpDEX volume and leaderboard points.
          Fee rebates: get 10% back from your own trading fees and 20% from the fees of traders you invite.
        </p>

        <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-black font-medium">
            <Link href="/profile#farm-connections">Start Farming</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/20 text-white hover:bg-white/10">
            <Link href="/bots">Explore Bots</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-6 opacity-80">
          <Image
            src="/images/airdrop_engine_aurora_soft.svg"
            alt="Airdrop Engine"
            width={40}
            height={40}
          />
          <p className="text-sm text-white/50">
            Runs inside Telegram (ArdraHubbot beta)
          </p>
        </div>

        {/* The supporters carousel is rendered at the page level (server) */}
      </div>
    </section>
  )
}















