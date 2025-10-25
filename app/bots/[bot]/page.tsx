import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Clock3, Cpu, LineChart, Layers, Download } from "lucide-react"

const HUB_REPO_URL = "https://github.com/ardraXYZ/ARDRAHUB"
const HUB_RELEASE_URL =
  "https://github.com/ardraXYZ/ARDRAHUB/releases/download/v1.0.0/ArdraHub_1.0.0_x64.msix"

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
    heroBadge: "Windows desktop bot",
    title: "Aster via Ardra Hub",
    description:
      "Harness Ardra Hub on Windows to run Aster automations with referral routing, rebate capture, and safety rails built in.",
    heroImage: "/images/support/Aster.png",
    primaryCta: {
      label: "Download Ardra Hub",
      href: HUB_RELEASE_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View source on GitHub",
      href: HUB_REPO_URL,
      variant: "outline",
    },
    features: [
      {
        title: "Windows-native runner",
        description: "Signed MSIX installer with automatic updates via the Ardra Hub release channel.",
      },
      {
        title: "Desktop control room",
        description: "Monitor balances, margin usage, and execution logs from a single Windows UI.",
      },
      {
        title: "Referral-aware automation",
        description: "Routes trades through Ardra referrals while distributing rebates back to your wallet.",
      },
      {
        title: "Safety rails included",
        description: "Session PIN, API key encryption, and kill-switch macros keep execution under your control.",
      },
    ],
    quickStart: [
      "Download ArdraHub_1.0.0_x64.msix from GitHub releases.",
      "Install on Windows (allow side-loading if SmartScreen prompts).",
      "Open Ardra Hub, select the Aster module, and load your wallet/API keys.",
      "Set strategy presets and referral key, then press Start Automation.",
    ],
    manualSetup: [
      "Verify the MSIX publisher signature before installing.",
      "Backup and encrypt Aster API keys outside the app.",
      "Use Windows Hello or a PIN to lock the session when AFK.",
      "Update via the in-app release channel to stay current.",
    ],
    safeguards: [
      "Test with minimal capital on first runs.",
      "Rotate API keys frequently and revoke unused credentials.",
      "Stop automation before shutting down Windows or disconnecting power.",
      "Review logs daily for any manual intervention cues.",
    ],
    stats: [
      { label: "Supported platform", value: "Windows 10/11" },
      { label: "Bots bundled", value: "Aster, Backpack, Pacifica" },
      { label: "Referral share", value: "20%-50% (KOL programs)" },
      { label: "Release channel", value: "GitHub MSIX" },
    ],
  }
}

function createBackpackConfig(): BotConfig {
  return {
    name: "Backpack",
    status: "live",
    heroBadge: "Windows desktop bot",
    title: "Backpack via Ardra Hub",
    description:
      "Automate Backpack perps from the Ardra Hub desktop runner with compliance-friendly safeguards and referral tracking built in.",
    heroImage: "/images/support/Backpack.png",
    primaryCta: {
      label: "Download Ardra Hub",
      href: HUB_RELEASE_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View source on GitHub",
      href: HUB_REPO_URL,
      variant: "outline",
    },
    features: [
      {
        title: "Regulated venue ready",
        description: "Compliant execution with referral attribution and rebate export built into the runner.",
      },
      {
        title: "Capital presets",
        description: "Define per-market limits, latency budgets, and kill-switch triggers per bot session.",
      },
      {
        title: "Audit-friendly logs",
        description: "Windows event history plus CSV exports for compliance and performance review.",
      },
    ],
    quickStart: [
      "Install Ardra Hub via the MSIX release.",
      "Open Backpack module, load API keys, and set regulatory labels if required.",
      "Assign referral ID + rebate wallet, then start automation.",
    ],
    manualSetup: [
      "Request trading-enabled API keys from Backpack before onboarding.",
      "Use Windows Credential Manager or a hardware vault to store secrets.",
      "Schedule regular CSV exports for compliance logs.",
    ],
    safeguards: [
      "Revoke and rotate Backpack keys frequently.",
      "Disable automation before editing risk parameters.",
      "Set lower leverage defaults for new wallets.",
    ],
    stats: [
      { label: "Supported platform", value: "Windows 10/11" },
      { label: "Referral aware", value: "20%-50% share" },
      { label: "Reporting", value: "CSV exports + logs" },
      { label: "Release channel", value: "GitHub MSIX" },
    ],
  }
}

function createPacificaConfig(): BotConfig {
  return {
    name: "Pacifica",
    status: "live",
    heroBadge: "Windows desktop bot",
    title: "Pacifica via Ardra Hub",
    description:
      "Run Pacifica cross-margin strategies through Ardra Hub with referral routing, rebate capture, and automated rotation between quests.",
    heroImage: "/images/support/Pacifica.png",
    primaryCta: {
      label: "Download Ardra Hub",
      href: HUB_RELEASE_URL,
      variant: "primary",
    },
    secondaryCta: {
      label: "View source on GitHub",
      href: HUB_REPO_URL,
      variant: "outline",
    },
    features: [
      {
        title: "Referral rotation",
        description: "Automatically rotate Pacifica referral links so every wallet in your tree is credited.",
      },
      {
        title: "Cross-margin presets",
        description: "Ship with curated risk profiles for farming campaigns, delta-neutral, and directional plays.",
      },
      {
        title: "Quest-friendly automations",
        description: "One-click macros for daily tasks, claim reminders, and proof-of-trade snapshots.",
      },
    ],
    quickStart: [
      "Install ArdraHub_1.0.0_x64.msix from GitHub releases.",
      "Launch Ardra Hub and pick the Pacifica module.",
      "Load wallet/API credentials, referral key, and quest profile.",
      "Start automation and monitor progress from the desktop dashboard.",
    ],
    manualSetup: [
      "Confirm your machine runs Windows 10/11 with admin rights for MSIX installs.",
      "Store Pacifica secrets in Windows Credential Manager or a hardware vault.",
      "Enable notifications inside Ardra Hub to receive quest reminders.",
    ],
    safeguards: [
      "Pause automation before tweaking capital allocation.",
      "Rotate referral keys only when automation is stopped.",
      "Export logs weekly for compliance or proof-of-volume checks.",
    ],
    stats: [
      { label: "Supported platform", value: "Windows 10/11" },
      { label: "Referral aware", value: "20%-50% share" },
      { label: "Quests automated", value: "Daily + weekly" },
      { label: "Release channel", value: "GitHub MSIX" },
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
                  <p>{config.status === "live" ? "Windows desktop runner with local key custody and offline-ready automation." : "Integration is in closed beta. Opt in through your profile to get notified."}</p>
                  <p>{config.status === "live" ? "Auditable MSIX published on GitHub Releases so you can verify every build." : "Track progress on GitHub as we finish the binaries."}</p>
                  <p>{config.status === "live" ? "Swap between Aster, Backpack, and Pacifica modules inside Ardra Hub." : "Expect the same unified control plane you know from Aster."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-16">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">Deploy Ardra Hub on Windows</h2>
          <p className="text-sm text-white/70">Grab the signed MSIX from GitHub Releases or clone the repo to inspect every line before compiling.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href={HUB_RELEASE_URL} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Download Windows installer
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href={HUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                View on GitHub <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
      title: "Windows-native automation",
      description: "Ardra Hub ships as a signed MSIX so you can install the bot runner directly on Windows 10/11.",
      icon: ShieldCheck,
    },
    {
      title: "Multi-bot cockpit",
      description: "Switch between Aster, Backpack, and Pacifica modules without reinstalling anything.",
      icon: Zap,
    },
    {
      title: "Open-source transparency",
      description: "Every release maps to the ARDRAHUB Git commits, making audits and forks straightforward.",
      icon: Clock3,
    },
  ]

  const steps = [
    {
      title: "Download from GitHub Releases",
      description: "Grab ArdraHub_1.0.0_x64.msix or clone the repo to build your own installer.",
    },
    {
      title: "Install on Windows 10/11",
      description: "Approve the signed MSIX, pass SmartScreen, and lock the session with Windows Hello or a PIN.",
    },
    {
      title: "Launch the Aster module",
      description: "Add wallet/API keys, set referral routing, then press Start Automation from the desktop console.",
    },
  ]

  const benefits = [
    {
      title: "Local key custody",
      description: "Secrets stay encrypted via Windows DPAPI—nothing leaves your machine unless you export it.",
      icon: Cpu,
    },
    {
      title: "Desktop telemetry",
      description: "Session logs, quest progress, and safeguards live inside Ardra Hub with CSV exports when needed.",
      icon: LineChart,
    },
    {
      title: "Controlled updates",
      description: "MSIX packages map back to the repository so you can diff every build before installing.",
      icon: Layers,
    },
  ]

  const faqs = [
    {
      question: "Preciso da extensão do Chrome?",
      answer: "Não. Ardra Hub é um aplicativo desktop para Windows com todos os módulos integrados.",
    },
    {
      question: "Como valido o build?",
      answer:
        "Baixe pelo GitHub Releases, compare o hash publicado ou gere seu próprio instalador clonando o repositório ARDRAHUB.",
    },
    {
      question: "Minhas chaves saem da máquina?",
      answer:
        "Não. As credenciais ficam criptografadas com DPAPI e só são usadas localmente para assinar requisições na Aster.",
    },
  ]

  const englishFaqs = [
    {
      question: "Do I still need the Chrome extension?",
      answer: "No. Ardra Hub is a Windows desktop runner that bundles every module, including Aster.",
    },
    {
      question: "How do I trust the installer?",
      answer:
        "Download the signed MSIX from GitHub Releases, verify the checksum, or compile your own build straight from the ARDRAHUB repo.",
    },
    {
      question: "Do my keys ever leave the machine?",
      answer:
        "No. Credentials stay encrypted via Windows DPAPI and are only used locally to sign requests to the Aster DEX.",
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
                  Execute a Aster direto do desktop Windows. Ardra Hub instala via MSIX assinado, mantém as chaves locais e entrega telemetria em tempo real.
                </p>
                <p className="text-lg text-white/70">
                  Run Aster from a Windows desktop runner. Ardra Hub installs via a signed MSIX, keeps keys local, and gives you live automation controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
                  <Link href={HUB_RELEASE_URL} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download Windows installer
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  <Link href={HUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                    View source on GitHub
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  <Link href={`${HUB_REPO_URL}#readme`} target="_blank" rel="noopener noreferrer">
                    Installation guide
                  </Link>
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
            Três passos para rodar o módulo da Aster dentro do Ardra Hub no Windows — sem depender de navegador.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Three steps to run the Aster module inside Ardra Hub on Windows—no browser dependency required.
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
          <h2 className="text-3xl font-semibold text-white">Pronto para rodar a Aster no desktop?</h2>
          <p className="text-sm text-white/70">Baixe o instalador Windows no GitHub, configure suas chaves na Ardra Hub e mantenha tudo local.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 bg-cyan-500 text-black hover:bg-cyan-400">
              <Link href={HUB_RELEASE_URL} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Baixar instalador
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
              <Link href={`${HUB_REPO_URL}#readme`} target="_blank" rel="noopener noreferrer">
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
