import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Puzzle, ShieldCheck, Timer, Plug, RefreshCcw, Settings } from "lucide-react"

const resources = [
  { title: "Download extension", description: "Load zip in Chrome (Developer Mode -> Load unpacked).", href: "https://github.com/ardraXYZ/extension.git", icon: Download, label: "Download .zip", primary: true },
  { title: "Installation guide", description: "Step-by-step setup instructions.", href: "/extension/README.txt", icon: Puzzle, label: "Open guide" },
  { title: "Keepalive tab", description: "Optional ultra-light page to preserve the bridge.", href: "/bots/keepalive", icon: Plug, label: "Open keepalive" },
]

const timeline = [
  { badge: "Step 1", title: "Install the bridge", description: "Load the extension once and Chrome remembers it.", icon: Download },
  { badge: "Step 2", title: "Configure in the popup", description: "Save keys and TP/SL/margin without leaving the browser.", icon: Settings },
  { badge: "Step 3", title: "Let alarms take over", description: "chrome.alarms fires ticks and PnL refresh in the background.", icon: RefreshCcw },
]

const badges = [
  "Keys never leave your browser",
  "chrome.alarms — persistent cadence",
  "Auto-resume after restart",
]

const fixedBadges = [
  "Keys never leave your browser",
  "chrome.alarms - persistent cadence",
  "Auto-resume after restart",
]

export function AsterExtensionGuide() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_60px_rgba(45,212,191,0.15)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-cyan-200">chrome.alarms • Persistent automation</div>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-white">Install once, orchestrate forever</h3>
            <p className="text-sm text-white/70">Save keys locally, tweak parameters in the popup and let Chrome schedules drive ticks and refreshes. No tab required.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {fixedBadges.map((item) => (
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
                <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-cyan-200 text-xs font-semibold whitespace-nowrap">{badge}</span>
                    <Icon className="h-5 w-5 text-cyan-300 transition group-hover:rotate-6" />
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
            <p className="mt-1 text-xs text-white/60">Download, configure and monitor with a click.</p>
            <div className="mt-5 space-y-3">
              {resources.map(({ title, description, href, icon: Icon, label, primary }) => (
                <div key={href} className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/[0.06]">
                  <div className="mt-1 rounded-full bg-cyan-400/15 p-2"><Icon className="h-4 w-4 text-cyan-200" /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-white/60">{description}</p>
                    <Button asChild size="sm" className={primary ? "mt-3 bg-cyan-500 text-black hover:bg-cyan-400" : "mt-3 border-white/20 text-white hover:bg-white/10"} variant={primary ? undefined : "outline"}>
                      <Link href={href}>{label}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-fuchsia-500/10 p-6">
            <h4 className="text-sm font-semibold text-white">Why this is safe</h4>
            <ul className="mt-3 space-y-2 text-xs text-white/70">
              <li>• State persisted in chrome.storage, auto-resume after restarts.</li>
              <li>• Alarms independent from any tab; minimized browser still runs.</li>
              <li>• Popup handles start/stop and params, avoiding heavy pages.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
