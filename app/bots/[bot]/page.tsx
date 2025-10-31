import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Zap, Clock3, Cpu, LineChart, Layers, Send } from "lucide-react"

const TELEGRAM_BOT_URL = "https://t.me/ArdraHubbot"

const botConfigs = {
  aster: createAsterConfig(),
  hyperliquid: createSoonConfig("Hyperliquid", {
    description:
      "Our Hyperliquid integration is being finalised with smart batching for native liquidity and nitro order placement.",
    heroImage: "/images/support/Hyperliquid.png",
  }),
  pacifica: createPacificaConfig(),
  paradex: createSoonConfig("Paradex", {
    description: "Paradex execution graph ships next with deep liquidity search and funding arbitrage guards.",
    heroImage: "/images/support/Paradex.png",
  }),
  backpack: createBackpackConfig(),
  avantis: createSoonConfig("Avantis", {
    description: "Avantis strategies are in progress with L2 orchestration and premium capture overlays.",
    heroImage: "/images/support/Avantis.png",
  }),
  standx: createSoonConfig("StandX", {
    description: "StandX automation focuses on institutional hedging templates and compliance tooling.",
    heroImage: "/images/support/StandX.png",
  }),
  lighter: createSoonConfig("Lighter", {
    description: "Lighter sniper integrates lightweight risk controls for thin-liquidity launches and rewards mining.",
    heroImage: "/images/support/Lighter.png",
  }),
} satisfies Record<string, BotConfig>

type BotStatus = "live" | "soon"

type BotConfig = {
  name: string
  status: BotStatus
  heroBadge: string
  title: string
  description: string
  heroImage: string
  primaryCta?: {
    label: string
    href: string
    variant: "primary" | "outline"
  }
  secondaryCta?: {
    label: string
    href: string
    variant: "primary" | "outline"
  }
  features: { title: string; description: string }[]
  quickStart: string[]
  manualSetup: string[]
  safeguards: string[]
  stats: { label: string; value: string }[]
}

function createAsterConfig(): BotConfig {
  return {
    name: "Aster",
    status: "live",
    heroBadge: "Telegram bot beta",
    title: "Aster on Telegram",
    description:
      "Trigger Aster runs directly from the ArdraHubbot conversation with margin, take-profit, and stop-loss presets guarding the beta.",
    heroImage: "/images/support/Aster.png",
    primaryCta: {
      label: "Open ArdraHubbot",
      href: TELEGRAM_BOT_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View active bots",
      href: "/bots",
      variant: "outline",
    },
    features: [
      {
        title: "Command from Telegram",
        description: "Launch, pause, and inspect runs with slash commands that work on desktop, web, or mobile.",
      },
      {
        title: "Beta guardrails",
        description: "Margin, take-profit, and stop-loss remain pre-set while we finish the custom parameter editor.",
      },
      {
        title: "Live execution feed",
        description: "Receive fills, funding alerts, and status changes in real time without opening the dashboard.",
      },
      {
        title: "Unified venues",
        description: "Swap between Aster, Backpack, and Pacifica strategies inside one conversation.",
      },
    ],
    quickStart: [
      "Open https://t.me/ArdraHubbot and tap Start to authenticate.",
      "Run /link to connect your Aster wallet or API keys.",
      "Confirm the preset guardrails and referral routing supplied in the beta.",
      "Send /run to launch automation and monitor the live feed.",
    ],
    manualSetup: [
      "Limit Aster API keys to trading and read access before linking.",
      "Bookmark the bot in Telegram so critical alerts stay pinned.",
      "Review available capital before issuing /run.",
      "Use /stop to pause sessions prior to changing venue permissions.",
    ],
    safeguards: [
      "Begin with reduced size on the first beta sessions.",
      "Rotate and revoke Aster credentials regularly.",
      "Pause the bot before moving funds between sub-accounts.",
      "Escalate to support if telemetry stops updating for more than 2 minutes.",
    ],
    stats: [
      { label: "Available on", value: "Telegram (web / desktop / mobile)" },
      { label: "Active venues", value: "Aster, Backpack, Pacifica" },
      { label: "Guardrails", value: "Margin/TP/SL fixed during beta" },
      { label: "Customization", value: "Advanced editor coming soon" },
    ],
  }
}

function createBackpackConfig(): BotConfig {
  return {
    name: "Backpack",
    status: "live",
    heroBadge: "Telegram bot beta",
    title: "Backpack on Telegram",
    description:
      "Execute regulated Backpack perps from ArdraHubbot with compliance-safe defaults and fixed guardrails while the beta matures.",
    heroImage: "/images/support/Backpack.png",
    primaryCta: {
      label: "Open ArdraHubbot",
      href: TELEGRAM_BOT_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View active bots",
      href: "/bots",
      variant: "outline",
    },
    features: [
      {
        title: "Compliance aware",
        description: "Attach referral IDs and reporting labels directly inside the Telegram workflow.",
      },
      {
        title: "Preset risk rails",
        description: "Margin, take-profit, and stop-loss levels stay locked during beta to keep flows predictable.",
      },
      {
        title: "Chat-native telemetry",
        description: "Receive fills, funding notices, and session summaries without leaving Telegram.",
      },
    ],
    quickStart: [
      "Open https://t.me/ArdraHubbot and start the conversation.",
      "Use /link to authorise Backpack API keys with trading and read scopes.",
      "Confirm the beta guardrails and referral wallet the bot surfaces.",
      "Send /run to begin execution and watch the live log.",
    ],
    manualSetup: [
      "Request Backpack API keys with trading plus read permissions only.",
      "Restrict IPs or passphrases on the keys before linking them to the bot.",
      "Document session summaries for compliance reviews.",
    ],
    safeguards: [
      "Stop the session with /stop before editing risk or referral parameters.",
      "Rotate Backpack API keys on a defined cadence.",
      "Keep leverage conservative while presets are fixed.",
    ],
    stats: [
      { label: "Available on", value: "Telegram (web / desktop / mobile)" },
      { label: "Referral tracking", value: "Built-in routing" },
      { label: "Guardrails", value: "Margin/TP/SL fixed during beta" },
      { label: "Reports", value: "Chat summaries + CSV export soon" },
    ],
  }
}

function createPacificaConfig(): BotConfig {
  return {
    name: "Pacifica",
    status: "live",
    heroBadge: "Telegram bot beta",
    title: "Pacifica on Telegram",
    description:
      "Rotate Pacifica cross-margin campaigns from ArdraHubbot with pre-defined guardrails and automated referral handling.",
    heroImage: "/images/support/Pacifica.png",
    primaryCta: {
      label: "Open ArdraHubbot",
      href: TELEGRAM_BOT_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View active bots",
      href: "/bots",
      variant: "outline",
    },
    features: [
      {
        title: "Referral rotation",
        description: "Keep every wallet in your tree credited while the bot handles rotations automatically.",
      },
      {
        title: "Preset strategies",
        description: "Beta ships with curated guardrails for farming, neutral, and directional flows.",
      },
      {
        title: "Quest-friendly alerts",
        description: "Receive quest reminders and proof-of-trade updates straight in Telegram.",
      },
    ],
    quickStart: [
      "Open https://t.me/ArdraHubbot and hit Start to unlock the commands.",
      "Use /link to connect Pacifica credentials with trading + read scopes.",
      "Choose the campaign preset surfaced by the bot and confirm referral routing.",
      "Send /run to activate automation and monitor the quest feed.",
    ],
    manualSetup: [
      "Ensure Pacifica API keys are scoped correctly before linking.",
      "Keep quest accounts funded ahead of launching new sessions.",
      "Enable Telegram notifications so reminders stay visible.",
    ],
    safeguards: [
      "Pause with /stop before adjusting capital allocation.",
      "Rotate referral keys only when the session is paused.",
      "Export chat logs weekly for compliance or proof-of-volume checks.",
    ],
    stats: [
      { label: "Available on", value: "Telegram (web / desktop / mobile)" },
      { label: "Campaign focus", value: "Quests + cross-margin" },
      { label: "Guardrails", value: "Margin/TP/SL fixed during beta" },
      { label: "Referral handling", value: "Automatic rotation" },
    ],
  }
}

function createSoonConfig(name: string, overrides: SoonOverrides): BotConfig {
  return {
    name,
    status: "soon",
    heroBadge: "In development",
    title: `${name} automation suite`,
    description: overrides.description,
    heroImage: overrides.heroImage,
    features: [
      {
        title: "Venue-native execution",
        description: "Optimised order placement, monitoring, and self-healing tuned to each DEX.",
      },
      {
        title: "Shared referral logic",
        description: "Earn Ardra leaderboard points and shared fees from the first trade.",
      },
      {
        title: "Unified dashboard",
        description: "Control every automation from the same cockpit with live telemetry.",
      },
    ],
    quickStart: [
      "Join the waitlist to get early builds and documentation drops.",
      "Vote inside the leaderboard profile for feature priorities.",
      "We will notify you when closed beta binaries are ready to run.",
    ],
    manualSetup: [
      "Prepare wallet or API credentials for the target venue.",
      "Keep Python 3.10+ installed for the local orchestrator.",
      "Ensure you can route websockets/http traffic for real-time state.",
    ],
    safeguards: [
      "Stay within capital allocations you can monitor in real time.",
      "Review audit logs regularly once the bot is enabled.",
      "Rotate API keys as soon as you remove access or change strategy.",
      "Pair with Ardra referrals to capture 10% lifetime of downstream fees.",
    ],
    stats: [
      { label: "Status", value: "Closed beta" },
      { label: "Launch window", value: "Q4" },
      { label: "Referral share", value: "10%" },
      { label: "Access", value: "Waitlist" },
    ],
  }
}

export async function generateMetadata({ params }: BotPageProps): Promise<Metadata> {
  const { bot } = await params
  const config = botConfigs[bot as keyof typeof botConfigs]
  if (!config) {
    return { title: "Ardra Bots" }
  }
  return {
    title: `${config.name} Bot | Ardra`,
    description: config.description,
  }
}

export default async function BotPage({ params }: BotPageProps) {
  const { bot } = await params
  if (bot === "aster") {
    return <AsterMarketingPage />
  }
  const config = botConfigs[bot as keyof typeof botConfigs]
  if (!config) return notFound()

  const isLive = config.status === "live"
  const ultraLight = true

  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Background glows removed for performance */}
      <div className="absolute inset-0 -z-10" />

      <section className="pt-36 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div className="space-y-8">
              <Badge className={isLive ? "bg-white/10 text-cyan-200 border border-cyan-400/30" : "bg-white/5 text-white/50 border border-white/15"}>
                {config.heroBadge}
              </Badge>
              <div className="space-y-4">
                <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl tracking-tight text-white text-glow">
                  {config.title}
                </h1>
                <p className="text-lg text-white/70 max-w-2xl">{config.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {config.primaryCta ? (
                  <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                    <Link href={config.primaryCta.href} target="_blank" rel="noopener noreferrer">
                      {config.primaryCta.label}
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="h-12 px-6 cursor-not-allowed bg-white/10 text-white/60" disabled>
                    Join waitlist soon
                  </Button>
                )}
                {config.secondaryCta ? (
                  <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                    <Link href={config.secondaryCta.href} target="_blank" rel="noopener noreferrer">
                      {config.secondaryCta.label}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-sm justify-center lg:justify-end">
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
                {/* Gradient blur removed */}
                <Image
                  src={config.heroImage}
                  alt={`${config.name} bot logotype`}
                  width={320}
                  height={320}
                  className="mx-auto h-48 w-48 object-contain"
                />
                <div className="mt-6 space-y-3 text-sm text-white/70">
                  <p>{config.status === "live" ? "Telegram command center with safeguarded presets so you can launch runs from any device." : "Integration is in closed beta. Opt in through your profile to get notified."}</p>
                  <p>{config.status === "live" ? "No installers required - authorise the bot in Telegram and monitor executions in real time." : "Track progress on GitHub as we finish the binaries."}</p>
                  <p>{config.status === "live" ? "Access Aster, Backpack, and Pacifica flows inside the same ArdraHubbot conversation." : "Expect the same unified control plane you know from Aster."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-16">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">Launch Ardra Hub in Telegram</h2>
          <p className="text-sm text-white/70">Start the ArdraHubbot conversation to farm Aster, Backpack, and Pacifica with the beta guardrails, free of installers.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" /> Open in Telegram
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href="/bots">View bots</Link>
            </Button>
          </div>
        </div>
      </section>
      {config.name === "Backpack" ? (
        <>
          {!ultraLight ? <SectionGrid title="Feature highlights" items={config.features} /> : null}

          {!ultraLight ? (
            <section className="pb-24">
              <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                  <ChecklistCard
                    title={config.status === "live" ? "Quick start workflow" : "How the beta rollout works"}
                    description={config.status === "live"
                      ? "Everything you need to get this bot trading in minutes with the packaged scripts."
                      : "Be the first to command this bot. Follow the steps to reserve your beta seat."}
                    items={config.quickStart}
                    icon="check"
                  />
                  <ChecklistCard
                    title={config.status === "live" ? "Manual installation" : "Prepare your environment"}
                    description={config.status === "live"
                      ? "Prefer the terminal? Follow the Python-based setup and launch the same dashboard experience."
                      : "Make sure your infra is aligned before enabling the integration."}
                    items={config.manualSetup}
                    icon="arrow"
                  />
                </div>
              </div>
            </section>
          ) : null}

          {!ultraLight ? (
            <section className="pb-24">
              <div className="mx-auto max-w-6xl px-6">
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8">
                  <h2 className="text-2xl font-semibold text-white">Risk safeguards</h2>
                  <p className="mt-3 text-sm text-white/70">
                    Scalping with leverage demands constant oversight. Keep these practices in rotation whenever the bot is
                    active.
                  </p>
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">
                    {config.safeguards.map((tip) => (
                      <li key={tip} className="flex gap-3 text-sm text-white/80">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {!ultraLight ? (
            <section className="pb-24">
              <div className="mx-auto max-w-6xl px-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
                  <h2 className="text-2xl font-semibold text-white">Performance snapshot</h2>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {config.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
                        <p className="text-sm text-white/60">{stat.label}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {!ultraLight ? (
            <section className="pb-24">
              <div className="mx-auto max-w-6xl px-6 text-center">
                <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-8 py-12">
                  <h2 className="text-3xl font-semibold text-white">Launch {config.name} from Telegram</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-white/70">
                    Orchestrate the run straight from ArdraHubbot with guardrails that keep margin, take-profit, and stop-loss locked during beta.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {isLive ? (
                      <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                        <Link href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                          Open in Telegram
                        </Link>
                      </Button>
                    ) : (
                      <Button size="lg" className="h-12 px-6 cursor-not-allowed bg-white/10 text-white/50" disabled>
                        Closed beta in progress
                      </Button>
                    )}
                    <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                      <Link href="/bots">Back to bots</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

type ChecklistCardProps = {
  title: string
  description: string
  items: string[]
  icon: "check" | "arrow"
}

function ChecklistCard({ title, description, items, icon }: ChecklistCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm text-white/60">{description}</p>
      <ul className="mt-6 space-y-4 text-sm text-white/70">
        {items.map((step) => (
          <li key={step} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] uppercase tracking-widest">
              {icon === "check" ? "✓" : "→"}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AsterMarketingPage() {
  const highlights = [
    {
      title: "Telegram-first automation",
      description: "Control every Ardra bot from the same chat experience - no installers required.",
      icon: ShieldCheck,
    },
    {
      title: "Guardrails activated",
      description: "Margin, take-profit, and stop-loss remain fixed during the beta to keep flows predictable.",
      icon: Zap,
    },
    {
      title: "Multi-venue cockpit",
      description: "Aster, Backpack, and Pacifica share the same Telegram conversation and runbooks.",
      icon: Clock3,
    },
  ]

  const steps = [
    {
      title: "Open ArdraHubbot",
      description: "Start a chat at https://t.me/ArdraHubbot and press Start to authenticate.",
    },
    {
      title: "Link your Aster access",
      description: "Use /link to connect wallets or API keys - credentials stay with the venue.",
    },
    {
      title: "Launch a run",
      description: "Send /run to start automation and follow the live feed directly in Telegram.",
    },
  ]

  const benefits = [
    {
      title: "Custody stays with you",
      description: "API keys and wallets never leave your control; Telegram only orchestrates the calls.",
      icon: Cpu,
    },
    {
      title: "Instant telemetry",
      description: "Funding alerts, fills, and safeguards stream into the chat in real time.",
      icon: LineChart,
    },
    {
      title: "Referral ready",
      description: "Referral routing and rebate tracking stay enabled even while presets are locked.",
      icon: Layers,
    },
  ]

  const faqs = [
    {
      question: "Do I need to install anything?",
      answer: "No. ArdraHubbot runs entirely inside Telegram on any device.",
    },
    {
      question: "Can I change margin, take profit, or stop loss?",
      answer: "Not yet. Those parameters stay locked during the beta to keep flows safe.",
    },
    {
      question: "Which venues are available?",
      answer: "Aster, Backpack, and Pacifica already run inside the same Telegram chat.",
    },
  ]

  const englishFaqs = [
    {
      question: "Do I need Windows or desktop installers?",
      answer: "No. Everything runs through ArdraHubbot on Telegram - mobile, desktop, or web.",
    },
    {
      question: "Can I change margin, take profit, or stop loss?",
      answer: "Not yet. Those guardrails stay fixed until the configurable editor ships after beta.",
    },
    {
      question: "Which venues are live in Telegram?",
      answer: "Aster, Backpack, and Pacifica all operate inside the same conversation today.",
    },
  ]

  return (
    <div className="bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_55%)]" />
        <div className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,_transparent_0%,_transparent_55%,_rgba(147,51,234,0.15)_100%)] lg:block" />
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <Badge className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">Telegram bot beta</Badge>
              <div className="space-y-4">
                <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl tracking-tight text-glow">Ardra Aster Bot</h1>
                <p className="text-lg text-white/70 hidden">
                  Controle a Aster direto do ArdraHubbot no Telegram. Nada para instalar, e os parametros de margem/TP/SL ficam protegidos durante o beta.
                </p>
                <p className="text-lg text-white/70">
                  Run Aster from ArdraHubbot on Telegram. There is nothing to install, and margin, take-profit, and stop-loss stay locked while the beta hardens.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                  <Link href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-4 w-4" /> Open in Telegram
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  <Link href="/bots">View active bots</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-sm justify-center lg:justify-end">
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
                <Image
                  src="/images/support/Aster.png"
                  alt="Aster bot logotype"
                  width={320}
                  height={320}
                  className="mx-auto h-48 w-48 object-contain"
                />
                <div className="mt-6 space-y-3 text-sm text-white/70">
                  <p>Telegram control plane with guardrails so presets stay protected during beta.</p>
                  <p>No installers - authenticate in chat and follow execution, funding, and safeguards in real time.</p>
                  <p>Aster, Backpack, and Pacifica live inside the same conversation for fast context switching.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-black/50 p-6">
                <Icon className="mb-4 h-6 w-6 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-white">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60 hidden">
            Three steps to run the Aster module via ArdraHubbot on Telegram.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Three steps to run the Aster module through ArdraHubbot on Telegram - no desktop required.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <span className="absolute -top-3 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-black font-semibold">{index + 1}</span>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/[0.02] border-y border-white/10">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-black/50 p-6">
                <Icon className="mb-4 h-6 w-6 text-emerald-300" />
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-white">FAQ</h2>
          <div className="mt-8 space-y-4">
            {englishFaqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-white/60">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-16 hidden">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">Ready to run Aster on Telegram?</h2>
          <p className="text-sm text-white/70">Open ArdraHubbot, link your credentials, and monitor everything directly from chat.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" /> Open in Telegram
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href="/bots">View active bots</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
type Feature = { title: string; description: string }



type BotPageParams = { bot: string }
 type BotPageProps = { params: Promise<BotPageParams> }
type SectionGridProps = {
  title: string
  items: Feature[]
}

function SectionGrid({ title, items }: SectionGridProps) {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-cyan-400/40"
            >
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
