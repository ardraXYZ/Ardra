"use client"

import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight, Flame, Gauge, Shield, Sparkles } from "lucide-react"

type BotStatus = "live"

type BotCard = {
  id: string
  name: string
  description: string
  status: BotStatus
  href: string
  logo: string
  tags: string[]
}

const bots: BotCard[] = [
  {
    id: "aster",
    name: "Aster",
    description: "Telegram automation for Aster quests, rebates, and laddered order flow.",
    status: "live",
    href: "/bots/aster",
    logo: "/images/support/Aster.png",
    tags: ["Cross-chain", "Quest ready"],
  },
  {
    id: "backpack",
    name: "Backpack",
    description: "Regulated perps flow routed through the Ardra Telegram bot with referral tracking.",
    status: "live",
    href: "/bots/backpack",
    logo: "/images/support/Backpack.png",
    tags: ["Regulated", "Wallet native"],
  },
  {
    id: "pacifica",
    name: "Pacifica",
    description: "Cross-margin presets and referral rotation handled inside the Telegram hub.",
    status: "live",
    href: "/bots/pacifica",
    logo: "/images/support/Pacifica.png",
    tags: ["Referral hub", "Dual wallet"],
  },
]



const highlights = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Telegram-native",
    body: "Run every Ardra bot straight from Telegram with no installers, licenses, or desktop setup required.",
  },
  {
    icon: <Gauge className="h-4 w-4" />,
    title: "Guardrails enabled",
    body: "Beta release ships with pre-set margin, take profit, and stop loss while we finish the custom controls.",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Multi-venue coverage",
    body: "Aster, Pacifica, and Backpack flows are all live inside the same Telegram command center.",
  },
]


export default function BotsIndexPage() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#05040f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.16),_transparent_60%)]" />
      <main className="relative mx-auto w-full max-w-7xl px-6 pb-28 pt-32 space-y-20">
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] p-10 shadow-[0_40px_140px_rgba(56,189,248,0.18)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(65%_80%_at_20%_0%,rgba(56,189,248,0.28),transparent),radial-gradient(75%_85%_at_80%_10%,rgba(147,51,234,0.2),transparent)]" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <Badge className="w-fit border-cyan-300/30 bg-cyan-400/10 text-cyan-100">Telegram Bot Beta</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                  Launch, monitor, and farm with every Ardra bot inside Telegram
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                  Ardra Hub now operates as a free Telegram bot. Aster, Backpack, and Pacifica strategies are live with
                  pre-defined margin, take profit, and stop loss rails while we finish the advanced configuration panel.
                  Future updates will let you personalize every parameter without leaving Telegram.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild className="h-11 rounded-full bg-cyan-500 px-6 text-black hover:bg-cyan-400">
                  <Link href="https://t.me/ArdraHubbot" target="_blank" rel="noreferrer" prefetch={false}>
                    Open in Telegram <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full border-cyan-400/40 text-cyan-200">
                  <Link href="/bots/aster">
                    View active bots <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid w-full max-w-sm gap-4 rounded-[28px] border border-white/10 bg-black/50 p-6 backdrop-blur">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/15 text-cyan-100">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/60">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Integration roster</h2>
              <p className="text-sm text-white/60">
                Aster, Pacifica, and Backpack already run in the Telegram beta. Parameter overrides are coming in the next release.
              </p>
            </div>
            <Badge className="border-purple-300/40 bg-purple-500/10 text-purple-100">Staged rollouts</Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {bots.map((bot) => {
              const isLive = bot.status === "live"

              return (
                <article
                  key={bot.id}
                  className={cn(
                    "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition",
                    isLive ? "group hover:border-cyan-400/40 hover:bg-white/10" : "opacity-70"
                  )}
                >
                  {isLive ? <Link href={bot.href} className="absolute inset-0 z-10" aria-label="Open" /> : null}
                  <div
                    className={cn(
                      "absolute -inset-10 -z-10 bg-gradient-to-br from-cyan-400/0 via-fuchsia-400/6 to-emerald-400/0 opacity-0 blur-3xl transition",
                      isLive ? "group-hover:opacity-100" : ""
                    )}
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      <Image src={bot.logo} alt={`${bot.name} logo`} width={80} height={80} className="h-12 w-12 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{bot.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {bot.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-white/70">{bot.description}</p>

                  <div className="mt-7 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/40">
                      {isLive ? <Flame className="h-4 w-4 text-emerald-300" /> : <Sparkles className="h-4 w-4 text-amber-200" />}
                      <span>{isLive ? "Live" : "Building"}</span>
                    </div>
                    {isLive ? (
                      <Button asChild size="sm" className="rounded-full bg-cyan-500 px-5 text-black hover:bg-cyan-400">
                        <Link href={bot.href}>
                          Launch <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="cursor-not-allowed rounded-full border-white/15 text-white/40" disabled>
                        Coming soon
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}


