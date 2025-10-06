"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { PACIFICA_REFERRAL_CODES } from "@/lib/pacifica-codes"


function usePacificaCode() {
  const [index, setIndex] = useState<number>(0)
  const [used, setUsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const rawIdx = localStorage.getItem("pacificaCodeIndex")
    const rawUsed = localStorage.getItem("pacificaUsedMap")
    if (rawIdx) setIndex(Number(rawIdx) || 0)
    if (rawUsed) {
      try {
        setUsed(JSON.parse(rawUsed) || {})
      } catch {}
    }
  }, [])

  const current = useMemo(() => {
    const total = PACIFICA_REFERRAL_CODES.length
    let i = index
    for (let j = 0; j < total; j++) {
      const code = PACIFICA_REFERRAL_CODES[i % total]
      if (!used[code]) return { code, i: i % total }
      i++
    }
    return { code: PACIFICA_REFERRAL_CODES[index % total], i: index % total }
  }, [index, used])

  const markUsed = (code: string) => {
    const next = { ...used, [code]: true }
    setUsed(next)
    localStorage.setItem("pacificaUsedMap", JSON.stringify(next))
    const total = PACIFICA_REFERRAL_CODES.length
    const nextIdx = (current.i + 1) % total
    setIndex(nextIdx)
    localStorage.setItem("pacificaCodeIndex", String(nextIdx))
  }

  const nextCode = () => {
    const total = PACIFICA_REFERRAL_CODES.length
    const nextIdx = (current.i + 1) % total
    setIndex(nextIdx)
    localStorage.setItem("pacificaCodeIndex", String(nextIdx))
  }

  const reset = () => {
    setUsed({})
    setIndex(0)
    localStorage.removeItem("pacificaUsedMap")
    localStorage.removeItem("pacificaCodeIndex")
  }

  return { current, markUsed, nextCode, reset }
}


export function CreateAccountsButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { current, markUsed, nextCode, reset } = usePacificaCode()

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(current.code) } catch {}
  }

  return (
    <div className={className}>
      <Button onClick={() => setOpen(true)} className="bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
        Create your accounts
      </Button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f1115] to-[#12151c] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent glow */}
            <div className="pointer-events-none absolute -inset-40 -z-10 bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/10 to-emerald-400/10 blur-3xl" />

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold leading-none">Create your accounts</h3>
                <p className="mt-1 text-xs text-white/60">Use our referral links to unlock benefits and track rewards.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {/* Aster */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <div className="mb-2 text-sm text-white/80">Aster</div>
                <Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                  <a href="https://www.asterdex.com/en/referral/c67143" target="_blank" rel="noreferrer">
                    Open Aster
                  </a>
                </Button>
              </div>

              {/* Backpack */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <div className="mb-2 text-sm text-white/80">Backpack</div>
                <Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                  <a href="https://backpack.exchange/join/ardra" target="_blank" rel="noreferrer">
                    Open Backpack
                  </a>
                </Button>
              </div>

              {/* Pacifica */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:col-span-2">
                <div className="mb-1 text-sm text-white/80">Pacifica</div>
                <p className="mb-3 text-xs text-white/60">Each code can be used once. If a code is invalid, generate the next one.</p>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <code className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-cyan-300">
                    {current.code}
                  </code>
                  <Button onClick={copyCode} size="sm" variant="outline" className="border-white/20 text-white/80">
                    Copy
                  </Button>
                  <Button onClick={() => markUsed(current.code)} size="sm" className="bg-emerald-500 text-black hover:bg-emerald-400">
                    Mark as used
                  </Button>
                  <Button onClick={nextCode} size="sm" variant="outline" className="border-white/20 text-white/80">
                    Next
                  </Button>
                  <Button onClick={reset} size="sm" variant="ghost" className="text-white/60 hover:text-white">
                    Reset list
                  </Button>
                </div>
              </div>

              {/* Hyperliquid */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <div className="mb-2 text-sm text-white/80">Hyperliquid</div>
                <Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                  <a href="https://app.hyperliquid.xyz/join/ARDRA" target="_blank" rel="noreferrer">
                    Open Hyperliquid
                  </a>
                </Button>
              </div>

              {/* Apex */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <div className="mb-2 text-sm text-white/80">Apex</div>
                <Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                  <a href="https://omni.apex.exchange/referral?referralCode=2CE78CNY" target="_blank" rel="noreferrer">
                    Open Apex
                  </a>
                </Button>
              </div>

              {/* StandX */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.06]">
                <div className="mb-2 text-sm text-white/80">StandX</div>
                <Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                  <a href="https://standx.com/referral?code=Ardra" target="_blank" rel="noreferrer">
                    Open StandX
                  </a>
                </Button>
              </div>

              {/* Others */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 opacity-60">
                <div className="mb-2 text-sm text-white/60">Paradex</div>
                <Button disabled variant="outline" className="w-full border-white/15 text-white/40">Coming soon</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

