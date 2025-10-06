import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AsterExtensionGuide } from "@/components/bots/aster-extension-control"
import { BackpackExtensionGuide } from "@/components/bots/backpack-extension-control"
import { ArrowRight, ShieldCheck, Zap, Clock3, Cpu, LineChart, Layers, Download } from "lucide-react"

const botConfigs = {
  aster: createAsterConfig(),
  hyperliquid: createSoonConfig("Hyperliquid", {
    description:
      "Our Hyperliquid integration is being finalised with smart batching for native liquidity and nitro order placement.",
    heroImage: "/images/support/Hyperliquid.png",
  }),
  pacifica: createSoonConfig("Pacifica", {
    description: "Pacifica auto-rebalancing is in QA with treasury heat-maps and volatility aware triggers.",
    heroImage: "/images/support/Pacifica.png",
  }),
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
    heroBadge: "New integration",
    title: "Aster Scalping Bot",
    description:
      "Automate perpetual strategies on Aster DEX with a local-first bot, layered safety controls, and a minimalist cockpit designed for fast decisions.",
    heroImage: "/images/support/Aster.png",
    primaryCta: {
      label: "View on GitHub",
      href: "https://github.com/0xVoltage/AsterBot",
      variant: "primary",
    },
    secondaryCta: {
      label: "Download ZIP",
      href: "https://github.com/0xVoltage/AsterBot/archive/refs/heads/main.zip",
      variant: "outline",
    },
    features: [
      {
        title: "One-click onboarding",
        description: "Install and launch the full stack locally with the bundled scripts or manual Python workflow.",
      },
      {
        title: "Intuitive control room",
        description: "Browser panel with live P&L, margin usage, and action logs keeping you close to every trade.",
      },
      {
        title: "Smart perpetual scalping",
        description: "Targets six Aster pairs with 10x leverage, automated entries, and synced manual positions.",
      },
      {
        title: "Risk tuned",
        description: "Adjust capital allocation, take-profit, and stop-loss presets from a clean settings surface.",
      },
    ],
    quickStart: [
      "Download the repository or ZIP archive to your workstation.",
      "Run `1-INSTALL.bat` once to provision dependencies and the web dashboard.",
      "Start the interface through `2-START_ASTERBOT.bat` and open http://localhost:5000.",
      "Drop in your Aster API keys, choose strategies, then press Start Bot.",
    ],
    manualSetup: [
      "Install Python 3.10+ and ensure it is on your PATH.",
      "Install dependencies with `pip install -r requirements.txt`.",
      "Launch the dashboard via `python run_web.py`.",
      "Visit http://localhost:5000 to finish configuration and begin trading.",
    ],
    safeguards: [
      "Use capital you can afford to allocate; test with minimal sizes first.",
      "Monitor the live dashboard frequently for manual intervention cues.",
      "Rotate API keys periodically and store them securely outside code repositories.",
      "Stop the bot before closing the terminal hosting the web server.",
    ],
    stats: [
      { label: "Pairs supported", value: "6 perpetuals" },
      { label: "Fixed leverage", value: "10x" },
      { label: "Trade check cadence", value: "≈12 cycles / minute" },
      { label: "Simultaneous positions", value: "Up to 3" },
    ],
  }
}

type SoonOverrides = {
  description: string
  heroImage: string
}



function createBackpackConfig(): BotConfig {
  return {
    name: "Backpack",
    status: "live",
    heroBadge: "New integration",
    title: "Backpack Perps Bot",
    description:
      "Rotate through every Backpack perpetual with liquidity-aware sizing straight from your browser.",
    heroImage: "/images/support/Backpack.png",
    primaryCta: {
      label: "Install Extension",
      href: "/extension/README.txt",
      variant: "primary",
    },
    secondaryCta: {
      label: "Open Control Panel",
      href: "/bots/backpack",
      variant: "outline",
    },
    features: [
      {
        title: "Full perp coverage",
        description: "Cycles across the entire Backpack futures list while respecting book depth thresholds.",
      },
      {
        title: "Liquidity guardrails",
        description: "Skips thin books automatically, logging the checks in the popup console.",
      },
      {
        title: "Shared parameters",
        description: "One TP/SL/margin profile fans out across dozens of tickers without extra screens.",
      },
      {
        title: "Quick toggles",
        description: "Start, stop, and adjust settings from the Chrome popup without touching code.",
      },
    ],
    quickStart: [
      "Load the Ardra extension in Chrome (Developer Mode ? Load unpacked).",
      "Select Backpack inside the popup and paste your API key pair.",
      "Tune TP/SL/margin values for the rotation.",
      "Press Start bot and keep the optional keepalive tab open for background ticks.",
    ],
    manualSetup: [
      "Enable Backpack API access and generate a key pair with trading permissions.",
      "Install the extension in Chrome once; it persists across restarts.",
      "Configure per-trade margin, take-profit, and stop-loss values in the popup.",
      "Use the logs panel to monitor symbol rotation and depth skips.",
    ],
    safeguards: [
      "Review Backpack account risk settings before letting the loop run unattended.",
      "Use small margin caps while you observe the first rotations.",
      "Keep Chrome running or pin the keepalive tab to preserve the alarm cadence.",
      "Revoke and refresh keys periodically from Backpack's security panel.",
    ],
    stats: [
      { label: "Perps scanned", value: "All visible markets" },
      { label: "Rotation cadence", value: "15s loop" },
      { label: "Risk controls", value: "Depth & timeout exits" },
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
                  <p>{config.status === "live" ? "Local Python service with optional web dashboard" : "Integration is in closed beta. Opt in through your profile to get notified."}</p>
                  <p>{config.status === "live" ? "API keys stay on your machine with referral tracking built-in." : "Referral rewards will activate the moment the integration goes live."}</p>
                  <p>{config.status === "live" ? "Scalping logic optimised for 10x leverage." : "Expect the same orchestration surface you know from Aster."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-16">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">Ready to run Aster on autopilot?</h2>
          <p className="text-sm text-white/70">Download the extension, configure your parameters in the popup, and let Chrome do the work for you.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href="/ardra-aster-bridge.zip">
                <Download className="mr-2 h-4 w-4" /> Download extension
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href="/extension/README.txt">
                Installation guide <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {config.name === "Backpack" ? (
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-6">
            <BackpackExtensionGuide />
          </div>
        </section>
      ) : null}

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
            <h2 className="text-3xl font-semibold text-white">Launch {config.name} from Ardra</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Combine Ardra orchestrations with venue-native automations. Clone, configure, and monitor — everything stays
              in your environment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {isLive ? (
                <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                  <Link href="https://github.com/0xVoltage/AsterBot" target="_blank" rel="noopener noreferrer">
                    Open repository
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
      title: "Local-first automation",
      description: "Run strategies from your machine. chrome.alarms keeps the bot alive even if the UI is closed.",
      icon: ShieldCheck,
    },
    {
      title: "Seconds to start",
      description: "Save keys in the popup, hit start, and alarms orchestrate recurring ticks with fail-safe retries.",
      icon: Zap,
    },
    {
      title: "24/7 cadence",
      description: "Minute-level scheduling, cached PnL, and automatic resume after browser restarts.",
      icon: Clock3,
    },
  ]

  const steps = [
    {
      title: "Install the bridge",
      description: "Download the zip, load it once via chrome://extensions (Developer Mode → Load unpacked).",
    },
    {
      title: "Configure in the popup",
      description: "Store API keys locally, set TP/SL/margin, and start the bot directly from the popup controls.",
    },
    {
      title: "Optionally open keepalive",
      description: "Use the ultra-light /bots/keepalive page only if you want a visual heartbeat. The bot itself does not need it.",
    },
  ]

  const benefits = [
    {
      title: "Service-worker resilience",
      description: "chrome.alarms, persisted state, and watchdog caching keep orchestration ticking even after restarts.",
      icon: Cpu,
    },
    {
      title: "Practical telemetry",
      description: "Cached active position counts and realized PnL stay ready for UI consumption without expensive fetches.",
      icon: LineChart,
    },
    {
      title: "Minimal footprint",
      description: "Zero dependencies on backend infrastructure. Everything runs in-browser with local storage only.",
      icon: Layers,
    },
  ]

  const faqs = [
    {
      question: "Do I need to keep a tab open?",
      answer:
        "Não. Os alarms do Chrome mantêm o bot ativo. Use a aba /bots/keepalive apenas se quiser observar um indicador visual.",
    },
    {
      question: "What if Chrome restarts?",
      answer:
        "O estado (botRunning, horário de início) é salvo e retomado automaticamente quando a extensão for carregada novamente.",
    },
    {
      question: "Os meus dados saem da máquina?",
      answer:
        "Não. As chaves são guardadas em chrome.storage.local e usadas apenas para assinar requisições diretamente para a Aster DEX.",
    },
  ]

  const englishFaqs = [
    {
      question: "Do I need to keep a tab open?",
      answer:
        "No. chrome.alarms keeps the bot running. Use the /bots/keepalive page only if you want a visual heartbeat.",
    },
    {
      question: "What if Chrome restarts?",
      answer:
        "State (botRunning, start time) is saved and automatically resumed when the extension loads again.",
    },
    {
      question: "Do my data ever leave my machine?",
      answer:
        "No. Keys are stored in chrome.storage.local and only used to sign requests directly to the Aster DEX.",
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
              <Badge className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">Available now</Badge>
              <div className="space-y-4">
                <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl tracking-tight text-glow">Ardra Aster Bot</h1>
                <p className="text-lg text-white/70 hidden">
                  Execute airdrop farming no modo autopiloto. A extensão assume todo o ciclo — start/stop no popup, alarms para
                  garantir cadência e persistência de estado para retomar automaticamente.
                </p>
                <p className="text-lg text-white/70">
                  Run airdrop farming on autopilot. The extension handles start/stop from the popup, uses chrome.alarms to keep cadence,
                  and persists state to resume automatically.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                  <Link href="/ardra-aster-bridge.zip">
                    <Download className="mr-2 h-4 w-4" /> Download extension
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  <Link href="/bots/keepalive">Open keepalive</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  <Link href="/extension/README.txt">Installation guide</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-md justify-center rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-fuchsia-400/15 to-emerald-400/20 blur-3xl" />
              <Image src="/images/support/Aster.png" alt="Aster bot" width={320} height={320} className="h-48 w-48 object-contain" />
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
            Três passos para colocar seu farming em modo automático. Não precisa de backend — tudo acontece no seu navegador.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Three steps to get your farming on autopilot. No backend required — everything runs in your browser.
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
          <AsterExtensionGuide />
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
          <h2 className="text-3xl font-semibold text-white">Pronto para rodar a Aster no piloto automático?</h2>
          <p className="text-sm text-white/70">Baixe a extensão, configure seus parâmetros no popup e deixe o Chrome trabalhar por você.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href="/ardra-aster-bridge.zip">
                <Download className="mr-2 h-4 w-4" /> Baixar extensão
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href="/extension/README.txt">
                Guia de instalação <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
