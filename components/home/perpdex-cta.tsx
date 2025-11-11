"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, ExternalLink } from "lucide-react"

type DexOption = { id: string; name: string; url: string; live?: boolean }

// Referral links mirrored from /profile Open farm configuration
const DEX_OPTIONS: DexOption[] = [
  { id: "aster", name: "Aster", url: "https://www.asterdex.com/en/referral/c67143", live: true },
  { id: "hyperliquid", name: "Hyperliquid", url: "https://app.hyperliquid.xyz/join/ARDRA" },
  { id: "hibachi", name: "Hibachi", url: "https://hibachi.xyz/r/ardrahub", live: true },
  { id: "pacifica", name: "Pacifica", url: "https://app.pacifica.fi?referral=Ardra", live: true },
  { id: "paradex", name: "Paradex", url: "https://app.paradex.trade/r/ardra" },
  { id: "backpack", name: "Backpack", url: "https://backpack.exchange/join/ardra", live: true },
  { id: "avantis", name: "Avantis", url: "https://www.avantisfi.com/referral?code=ardra" },
  { id: "standx", name: "StandX", url: "https://standx.com/referral?code=Ardra" },
  { id: "outkast", name: "Outkast", url: "https://www.outkast.xyz/?r=n99Vz" },
]

export function PerpDexCta({ children, frameless = false }: { children?: React.ReactNode; frameless?: boolean }) {
  const [selected, setSelected] = useState<string>(DEX_OPTIONS[0].id)
  const current = useMemo(() => DEX_OPTIONS.find((d) => d.id === selected)!, [selected])

  const Outer: React.ElementType = frameless ? 'div' : 'section'
  const outerClass = frameless ? 'mt-2' : 'site-wrap mx-auto -mt-[1px] mb-0'
  const innerClass = frameless ? '' : 'relative overflow-hidden frame frame--cta-middle p-5 md:p-6 backdrop-blur-xl'

  return (
    <Outer className={outerClass}>
      <div className={innerClass}>
        {/* Keep CTA top stroke visible so it meets the hero; hide only the bottom to let footer draw that seam */}
        <div className="frame-bottom-eraser" aria-hidden />

          <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
          {/* Left copy */}
          <div className="space-y-2">
            <h3 className="font-orbitron text-2xl md:text-3xl text-white text-glow">Start earning with Ardra</h3>
            <p className="text-sm md:text-base text-white/70 max-w-prose">
              Create your account at a Perp DEX and start farming. Earn Ardra Points, fee rebates, and network
              points via referrals.
            </p>
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <div className="flex w-full items-center gap-3 md:justify-end">
              <label htmlFor="dex" className="whitespace-nowrap text-xs uppercase tracking-[0.28em] text-white/50">
                Perp DEX
              </label>
              <div className="select-glass inline-flex">
                <select
                  id="dex"
                  aria-label="Perp DEX"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="appearance-none rounded-xl border border-white/15 bg-white/10 px-4 py-2 pr-9 text-sm text-white/90 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition-colors focus:border-cyan-300/50 hover:border-white/25"
                >
                  {DEX_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <Link
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 self-end rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(34,211,238,0.35)] transition hover:shadow-[0_18px_40px_rgba(34,211,238,0.45)]"
            >
              Create account & start
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="text-[11px] text-white/50 md:self-end">
              <ExternalLink className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-white/40" /> Opens the selected DEX
              in a new tab
            </div>
          </div>
        </div>

        {/* Optional child slot: e.g., logos marquee */}
        {children ? <div className="mt-4 md:mt-5">{children}</div> : null}

        {/* Soft bottom glow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-40%] h-[60%] bg-gradient-to-t from-emerald-400/10 via-sky-400/5 to-transparent blur-3xl" />
      </div>
    </Outer>
  )
}

export default PerpDexCta
