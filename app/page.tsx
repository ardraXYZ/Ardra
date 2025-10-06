import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { SupportersMarquee } from "@/components/supporters-marquee"
import { MissionSection } from "@/components/home/mission-section"
import { CommandCenterSection } from "@/components/home/command-center-section"
import { ExecutionFlowSection } from "@/components/home/execution-flow-section"
import { EconomicsSection } from "@/components/home/economics-section"
import { FinalCtaSection } from "@/components/home/final-cta-section"
import { SiteFooter } from "@/components/site-footer"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="min-h-[100svh] bg-black">
      <SiteHeader />
      <main>
        <Hero />
        <div className="mx-auto max-w-7xl px-6 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-14">
          {/* Supporters carousel (server) */}
          <SupportersMarquee />
        </div>
        <MissionSection />
        <CommandCenterSection />
        <ExecutionFlowSection />
        <EconomicsSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}








