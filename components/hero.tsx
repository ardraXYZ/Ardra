"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import OffImg from "@/Images/Ardra Assets/OFF.png"
import OnImg from "@/Images/Ardra Assets/ON.png"

export function Hero() {
  const [sumPoints, setSumPoints] = useState<number | null>(null)
  const [usersCount, setUsersCount] = useState<number | null>(null)

  // Load leaderboard once and compute metrics
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const tryFetch = async (url: string) => {
          const r = await fetch(url, { cache: "no-store" })
          if (!r.ok) throw new Error(String(r.status))
          return r.json()
        }
        let data: any
        try {
          data = await tryFetch("/api/leaderboard")
        } catch {
          data = await tryFetch("/leaderboard")
        }

        const arr: any[] = Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data)
              ? data
              : []

        const sum = arr.reduce((acc, e) => {
          const n = Number(e?.totalPoints ?? e?.points ?? e?.ardraPoints ?? 0)
          return acc + (Number.isFinite(n) ? n : 0)
        }, 0)

        if (!cancelled) {
          setSumPoints(sum)
          setUsersCount(arr.length)
        }
      } catch {
        if (!cancelled) {
          setSumPoints(0)
          setUsersCount(0)
        }
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const formatCompact = (n: number) => {
    try {
      const s = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(n)
      // Map "M" -> "mi" para manter o estilo visual anterior
      return s.replace(/M\b/, "mi").replace(/B\b/, "bi")
    } catch {
      if (!Number.isFinite(n)) return "0"
      const abs = Math.abs(n)
      if (abs >= 1e9) return (n / 1e9).toFixed(2) + "bi"
      if (abs >= 1e6) return (n / 1e6).toFixed(2) + "mi"
      if (abs >= 1e3) return (n / 1e3).toFixed(2) + "k"
      return String(n)
    }
  }

  return (
    <section className="relative isolate">
      <div className="site-wrap mx-auto h-full pt-0 pb-0 sm:pt-0 sm:pb-0">
        <div className="frame -mt-px px-4 sm:px-6 pt-12 pb-7 sm:pt-16 sm:pb-9 hero-fit relative z-0">
        <div className="hero-badge mb-4 inline-flex self-start items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_theme(colors.cyan.400)]" />
          Live - Airdrop Automation
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.35fr] items-start gap-8">
          <div>
            <h1 className="hero-title font-orbitron text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white text-glow leading-[1.12] pb-1 max-w-2xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                Boost your
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                Perp DEX
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                farming
              </span>
            </h1>

            <p className="hero-subtitle mt-6 max-w-xl text-base sm:text-lg md:text-xl text-white/75 font-sans leading-relaxed">
              Farm smarter, rank higher.
            </p>

            {/* CTA buttons removed as requested */}
          </div>

          <div className="hidden md:flex justify-end group">
            <div className="relative w-full max-w-[960px] lg:max-w-[1080px] xl:max-w-[1200px] h-auto animate-ardra-float -mt-6 md:-mt-10 lg:-mt-16 xl:-mt-20">
              {/* Base OFF image */}
              <Image
                src={OffImg}
                alt="Ardra device (off)"
                className="w-full h-auto object-contain transition-opacity duration-300 group-hover:opacity-0"
                priority
              />
              {/* Hover ON image */}
              <Image
                src={OnImg}
                alt="Ardra device (on)"
                className="pointer-events-none absolute inset-0 w-full h-auto object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                priority
              />

              {/* ARDRA HUB overlay with 45° perspective */}
              <div className="pointer-events-none absolute inset-0 flex items-start justify-start pl-44 md:pl-68 lg:pl-72 pt-20 md:pt-32 lg:pt-40">
                <div
                  className="select-none font-orbitron text-white text-sm md:text-base lg:text-lg font-semibold tracking-[0.08em] text-glow"
                  style={{
                    // Rotação mais anti-horário e menos inclinação vertical (suaviza o "morro")
                    transform: "perspective(2500px) rotateX(52deg) rotateZ(-46deg) translateY(-80px)",
                    transformOrigin: "left center",
                    letterSpacing: "0.08em",
                  }}
                >
                  <div className="text-left leading-[1.05]">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                      Current Volume
                    </span>
                    <span className="mt-1 block number-line">
                      {`$${formatCompact(sumPoints ?? 0)}`}
                    </span>

                    <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                      PerpDexs Live
                    </span>
                    <span className="mt-1 block number-line">9</span>

                    <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300">
                      Total users
                    </span>
                    <span className="mt-1 block number-line">{usersCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}











