import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { SupportersMarquee } from "@/components/supporters-marquee"
import { PerpDexCta } from "@/components/home/perpdex-cta"
import { SiteFooter } from "@/components/site-footer"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="h-[100svh] overflow-hidden bg-[#05040f] relative isolate">
      <SiteHeader />
      {/* Global background for entire homepage to avoid visible cuts */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-hero-grid opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),_transparent_55%),radial-gradient(circle_at_center,_rgba(15,23,42,0.85),_transparent_70%)]" />
        <div className="pointer-events-none absolute -top-48 left-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-fuchsia-400/22 blur-[140px]" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-400/14 blur-[120px]" />
      </div>

      <main className="home-main">
        <div className="home-stack">
          <Hero />
          <PerpDexCta>
            {/* Supporters carousel (server) now lives inside the card */}
            <SupportersMarquee />
          </PerpDexCta>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
