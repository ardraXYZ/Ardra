"use client"

import { useEffect, useState, useRef } from "react"
import { ShieldCheck, Coins } from "lucide-react"

function useCountUp(target: number, durationMs = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return Number(value.toFixed(decimals))
}

function fmtCurrency(n: number) {
  try {
    return n.toLocaleString(undefined)
  } catch {
    return String(n)
  }
}

export function HeroStatsPanel() {
  // Demo targets — replace with live metrics
  const tvl = useCountUp(563_125_511, 1400)
  const revenue = useCountUp(22.7, 1600, 2)
  const stakingApy = useCountUp(21, 1000)
  const lockingApy = useCountUp(66, 1000)

  // Parallax tilt + glow tracking
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 })
  function handleMove(e: React.MouseEvent) {
    const el = frameRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const ry = (px - 0.5) * 14 // yaw
    const rx = -(py - 0.5) * 10 // pitch
    setTilt({ rx, ry, gx: px * 100, gy: py * 100 })
  }
  function handleLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 }) }

  return (
    <div className="relative w-full max-w-[420px] select-none">
      {/* Outer modern frame with gradient border and glow */}
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="device-frame animate-float-slow group"
        style={{
          // @ts-ignore CSS custom props for transforms + glow
          "--rx": `${tilt.rx}deg`,
          "--ry": `${tilt.ry}deg`,
          "--g-x": `${tilt.gx}%`,
          "--g-y": `${tilt.gy}%`,
        }}
      >
        {/* Content layer */}
        <div className="relative z-[1] p-5 md:p-6">
          <div className="device-inner rounded-2xl p-4 md:p-5">
            <div className="text-sm text-white/70">Current TVL</div>
            <div className="mt-2 font-semibold text-white text-3xl md:text-4xl tracking-tight value-luminous tabular-nums">${fmtCurrency(Math.round(tvl))}</div>

            <div className="mt-6 text-sm text-white/70">Yearly Protocol Revenue</div>
            <div className="mt-1 text-2xl md:text-3xl font-semibold text-white tabular-nums">${revenue.toFixed(2)}M</div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="metric-tile">
                <div className="metric-label">Staking APY</div>
                <div className="metric-value">
                  {Math.round(stakingApy)}%
                  <Coins className="h-4 w-4 text-emerald-300/90" />
                </div>
              </div>
              <div className="metric-tile">
                <div className="metric-label">Locking APY</div>
                <div className="metric-value">
                  {Math.round(lockingApy)}%
                  <ShieldCheck className="h-4 w-4 text-cyan-300/90" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <span className="badge-soft">Audited 20 times</span>
            </div>
          </div>

          {/* Attached small ticket */}
          <div className="panel-ticket animate-float-slower group-hover:translate-y-[-2px] transition-transform">
            <div className="ticket-label">Redistributed</div>
            <div className="ticket-value">$18.95M</div>
          </div>
        </div>

        {/* Shine + sweep overlays */}
        <div className="device-shine" />
        <div className="device-sweep" />

        {/* Side lugs to suggest device frame */}
        <div className="panel-lug panel-lug-left" />
        <div className="panel-lug panel-lug-right" />
      </div>
    </div>
  )
}

export default HeroStatsPanel
