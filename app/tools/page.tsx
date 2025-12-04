import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ToolsShell } from "@/components/tools/tools-shell"

export const metadata = {
    title: "Tools | Ardra",
    description: "Unified hub for Ardra tools: bots, analytics and soon calculators.",
}

export default function ToolsPage() {
    return (
        <div className="relative min-h-screen bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.16),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.92),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
                <div className="pointer-events-none absolute -top-40 left-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-[120px]" />
                <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-fuchsia-400/18 blur-[140px]" />
            </div>

            <SiteHeader />
            <main className="relative z-10 pb-24 pt-28">
                <ToolsShell />
            </main>
            <SiteFooter />
        </div>
    )
}
