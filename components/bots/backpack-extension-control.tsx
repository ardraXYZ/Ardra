import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Layers, Settings, ShieldCheck, Activity, Plug } from "lucide-react"

const resources = [
  {
    title: "Install the extension",
    description: "Load the Ardra bridge once (Developer Mode -> Load unpacked).",
    href: "/ardra-aster-bridge.zip",
    icon: Download,
    label: "Download .zip",
    primary: true,
  },
  {
    title: "Setup checklist",
    description: "Step-by-step guide for keys, rotation and keepalive tabs.",
    href: "/extension/README.txt",
    icon: Layers,
    label: "Open guide",
  },
  {
    title: "Keepalive tab",
    description: "Optional ultra-light page that keeps alarms firing in the background.",
    href: "/bots/keepalive",
    icon: Plug,
    label: "Open keepalive",
  },
]

const timeline = [
  {
    badge: "Step 1",
    title: "Load once",
    description: "Import the extension and pin the popup for quick access.",
    icon: Download,
  },
  {
    badge: "Step 2",
    title: "Save Backpack keys",
    description: "Select Backpack in the popup, drop your API keys and choose margins.",
    icon: Settings,
  },
  {
    badge: "Step 3",
    title: "Let rotation run",
    description: "Chrome alarms handle symbol cycling and depth checks in the background.",
    icon: Activity,
  },
]

const badges = [
  "All Backpack perps in one loop",
  "Depth-aware entries",
  "chrome.alarms cadence",
]

export function BackpackExtensionGuide() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_60px_rgba(45,212,191,0.12)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-200">Backpack perps - Chrome native</div>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-white">Install once, rotate them all</h3>
            <p className="text-sm text-white/70">The popup now bundles Backpack alongside Aster. Save keys, tweak risk limits, and let the browser handle symbol scanning.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {badges.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white/70 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-[16px,1fr]">
            <div className="hidden md:block h-full w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />
            <div className="space-y-4">
              {timeline.map(({ badge, title, description, icon: Icon }) => (
                <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-emerald-200 text-xs font-semibold whitespace-nowrap">{badge}</span>
                    <Icon className="h-5 w-5 text-emerald-300 transition group-hover:rotate-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-white">{title}</h4>
                  <p className="text-xs text-white/60">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur">
            <h4 className="text-sm font-semibold text-white">Quick links</h4>
            <p className="mt-1 text-xs text-white/60">Install, configure and monitor the Backpack rotation.</p>
            <div className="mt-5 space-y-3">
              {resources.map(({ title, description, href, icon: Icon, label, primary }) => (
                <div key={href} className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.06]">
                  <div className="mt-1 rounded-full bg-emerald-400/15 p-2">
                    <Icon className="h-4 w-4 text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-white/60">{description}</p>
                    <Button asChild size="sm" className={primary ? "mt-3 bg-emerald-500 text-black hover:bg-emerald-400" : "mt-3 border-white/20 text-white hover:bg-white/10"} variant={primary ? undefined : "outline"}>
                      <Link href={href}>{label}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-fuchsia-500/10 p-6">
            <h4 className="text-sm font-semibold text-white">Why it works</h4>
            <ul className="mt-3 space-y-2 text-xs text-white/70">
              <li>- Liquidity checks run before every rotation, skipping thin books automatically.</li>
              <li>- chrome.alarms keeps cadence even if the popup is closed.</li>
              <li>- Logs inside the popup help you audit symbol decisions in seconds.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
