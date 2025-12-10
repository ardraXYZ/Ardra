"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Bot, ChartBar, Calculator, Sparkles, ShieldCheck, Gauge } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Animated icon wrapper with gradient and glow effects
function AnimatedIcon({
    children,
    gradientFrom,
    gradientTo,
    glowColor
}: {
    children: ReactNode
    gradientFrom: string
    gradientTo: string
    glowColor: string
}) {
    return (
        <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {/* Glow effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full blur-xl opacity-60 transition-opacity group-hover:opacity-100",
                    glowColor
                )}
            />
            {/* Icon container with gradient */}
            <div
                className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-2xl",
                    "bg-gradient-to-br shadow-lg",
                    gradientFrom,
                    gradientTo
                )}
            >
                {/* Inner glow */}
                <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                {/* Animated pulse ring */}
                <motion.div
                    className="absolute inset-0 rounded-2xl border border-white/30"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                {/* Icon */}
                <div className="relative z-10 text-white drop-shadow-lg">
                    {children}
                </div>
            </div>
        </motion.div>
    )
}

type ToolCard = {
    title: string
    description: string
    href?: string
    icon: ReactNode
    badge?: string
    disabled?: boolean
}

const tools: ToolCard[] = [
    {
        title: "Bots",
        description: "Launch Ardra bots with safe defaults, live controls and audit-friendly telemetry.",
        href: "/bots",
        icon: (
            <AnimatedIcon
                gradientFrom="from-violet-500"
                gradientTo="to-fuchsia-500"
                glowColor="bg-violet-500/40"
            >
                <Bot className="h-6 w-6" />
            </AnimatedIcon>
        ),
        badge: "Live"
    },
    {
        title: "PerpMonitor",
        description: "Real-time volume and open interest leaderboard across top perpetual venues.",
        href: "/PerpMonitor",
        icon: (
            <AnimatedIcon
                gradientFrom="from-cyan-500"
                gradientTo="to-blue-500"
                glowColor="bg-cyan-500/40"
            >
                <ChartBar className="h-6 w-6" />
            </AnimatedIcon>
        ),
        badge: "Live"
    },
    {
        title: "Calculators",
        description: "Airdrop and fee-rebate simulators (Backpack, Aster).",
        href: "/calculators",
        icon: (
            <AnimatedIcon
                gradientFrom="from-emerald-500"
                gradientTo="to-teal-500"
                glowColor="bg-emerald-500/40"
            >
                <Calculator className="h-6 w-6" />
            </AnimatedIcon>
        ),
        badge: "Live"
    }
]

export function ToolsShell() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 md:px-8">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-8 sm:px-10 sm:py-12 shadow-[0_20px_120px_rgba(56,189,248,0.16)] backdrop-blur"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.12),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.12),transparent_35%)]" />
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70">
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                            Ardra Toolkit
                        </div>
                        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-white">
                            Operate Ardra from one hub
                        </h1>
                        <p className="text-base sm:text-lg text-white/75 leading-relaxed">
                            Launch bots, monitor perp liquidity on PerpMonitor, and soon run airdrop simulations with Calculators.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
                                <Gauge className="h-4 w-4 text-emerald-300" />
                                Direct access
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
                                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                                Ardra experience
                            </span>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        className="relative"
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-fuchsia-400/20 to-emerald-400/25 blur-3xl" />
                        <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                                <Gauge className="h-6 w-6 text-cyan-200" />
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Live shortcuts</div>
                                <div className="text-lg font-semibold text-white">Bots · PerpMonitor · Calculators</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                className="grid gap-6 md:grid-cols-3"
            >
                {tools.map(tool => {
                    const CardContent = (
                        <div
                            className={cn(
                                "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition",
                                "hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08] hover:shadow-[0_24px_80px_rgba(56,189,248,0.12)]",
                                "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition before:duration-300 before:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.12),transparent_45%)] group-hover:before:opacity-100",
                                tool.disabled && "opacity-70 hover:translate-y-0 hover:shadow-none"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {tool.icon}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                                        <p className="text-sm text-white/65">{tool.description}</p>
                                    </div>
                                </div>
                                {tool.badge && (
                                    <span
                                        className={cn(
                                            "rounded-full px-3 py-1 text-xs font-semibold",
                                            tool.badge === "Live"
                                                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                                                : "bg-white/10 text-white/70 border border-white/15"
                                        )}
                                    >
                                        {tool.badge}
                                    </span>
                                )}
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-6 text-sm font-semibold text-cyan-200">
                                {tool.disabled ? (
                                    <span className="flex items-center gap-2 text-white/50">
                                        <Sparkles className="h-4 w-4" />
                                        Coming soon
                                    </span>
                                ) : (
                                    <>
                                        <span>Open</span>
                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </>
                                )}
                            </div>
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-fuchsia-400/10 to-emerald-400/10" />
                            </div>
                        </div>
                    )

                    const motionCard = (
                        <motion.div
                            key={tool.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                            whileHover={!tool.disabled ? { y: -6, scale: 1.01 } : undefined}
                            whileTap={!tool.disabled ? { scale: 0.995 } : undefined}
                            className="h-full"
                        >
                            {tool.disabled || !tool.href ? (
                                CardContent
                            ) : (
                                <Link href={tool.href} className="block h-full">
                                    {CardContent}
                                </Link>
                            )}
                        </motion.div>
                    )

                    return motionCard
                })}
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut", delay: 0.08 }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/3 to-white/10 px-6 py-7 sm:px-8 sm:py-9 backdrop-blur"
            >
                <div className="grid gap-4 md:grid-cols-[1.4fr_auto] md:items-center">
                    <div className="space-y-3">
                        <div className="text-xs uppercase tracking-[0.28em] text-white/60">Flow</div>
                        <h2 className="text-2xl font-semibold text-white">Pick your next move</h2>
                        <p className="max-w-2xl text-sm sm:text-base text-white/72">
                            Spin up bots to generate volume, watch liquidity on PerpMonitor, or soon simulate airdrops in Calculators.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            asChild
                            className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black hover:from-cyan-300 hover:via-sky-300 hover:to-emerald-300"
                        >
                            <Link href="/bots">Open Bots</Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="border border-white/15 bg-white/5 text-white hover:border-cyan-300/40 hover:bg-white/10"
                        >
                            <Link href="/PerpMonitor">Open PerpMonitor</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="border border-white/10 bg-white/5 text-white/55 pointer-events-none"
                        >
                            Calculators (soon)
                        </Button>
                    </div>
                </div>
            </motion.section>
        </div>
    )
}
