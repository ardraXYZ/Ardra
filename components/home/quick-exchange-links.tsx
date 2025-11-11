"use client"

import Link from "next/link"

type ExchangeLink = { id: string; name: string; url: string }

// Sourced from the same referrals used on /profile (Open farm)
const EXCHANGES: ExchangeLink[] = [
  { id: "aster", name: "Aster", url: "https://www.asterdex.com/en/referral/c67143" },
  { id: "hyperliquid", name: "Hyperliquid", url: "https://app.hyperliquid.xyz/join/ARDRA" },
  { id: "hibachi", name: "Hibachi", url: "https://hibachi.xyz/r/ardrahub" },
  { id: "paradex", name: "Paradex", url: "https://app.paradex.trade/r/ardra" },
  { id: "backpack", name: "Backpack", url: "https://backpack.exchange/join/ardra" },
  { id: "avantis", name: "Avantis", url: "https://www.avantisfi.com/referral?code=ardra" },
  { id: "standx", name: "StandX", url: "https://standx.com/referral?code=Ardra" },
  { id: "outkast", name: "Outkast", url: "https://www.outkast.xyz/?r=n99Vz" },
]

export function QuickExchangeLinks() {
  return (
    <div className="site-wrap mx-auto px-6 mt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {EXCHANGES.map((ex) => (
            <Link
              key={ex.id}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-colors hover:border-cyan-300/50 hover:bg-white/10 hover:text-white"
            >
              {ex.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickExchangeLinks

