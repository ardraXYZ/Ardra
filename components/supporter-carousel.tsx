"use client"

import { Card } from "@/components/ui/card"
import type { CSSProperties } from "react"

type Props = {
  logos: { src: string; alt: string }[]
}

export function SupporterCarousel({ logos }: Props) {
  if (!logos?.length) return null

  const track = [...logos, ...logos]

  return (
    <div className="relative overflow-hidden mask-fade-x">
      {(() => {
        const duration = `${Math.max(18, logos.length * 4)}s`
        const marqueeStyle: CSSProperties & { ['--duration']?: string } = { ['--duration']: duration }
        return (
          <div className="marquee-track flex items-stretch gap-4 will-change-transform" style={marqueeStyle}>
            {track.map((logo, idx) => (
              <Card
                key={`${logo.src}-${idx}`}
                className="neon-card min-w-[180px] sm:min-w-[220px] md:min-w-[260px] h-[84px] sm:h-[96px] md:h-[110px] flex items-center justify-center bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 rounded-3xl"
              >
                <div className="px-4 py-3 w-full h-full flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width={220}
                    height={80}
                    className="max-h-[72px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Card>
            ))}
          </div>
        )
      })()}
    </div>
  )
}


