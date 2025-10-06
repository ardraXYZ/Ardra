import { spawn, ChildProcessWithoutNullStreams } from "node:child_process"
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

type AsterSession = {
  pid?: number
  proc?: ChildProcessWithoutNullStreams
  status: "stopped" | "running" | "error"
  startedAt?: number
  configPath?: string
  log: string[]
  lastError?: string
}

const sessions = new Map<string, AsterSession>()

function getWorkspaceRoot() {
  // Assume this file lives under ardra/lib; workspace root is up one from ardra
  return join(process.cwd(), "..")
}

function getAsterRepoPath() {
  return join(getWorkspaceRoot(), "AsterBot-src")
}

function getUserConfigDir(userId: string) {
  const dir = join(process.cwd(), ".aster", userId)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeUserConfig(userId: string, config: Record<string, any>) {
  const dir = getUserConfigDir(userId)
  const p = join(dir, "config.json")
  writeFileSync(p, JSON.stringify(config, null, 2), "utf-8")
  const s = ensureSession(userId)
  s.configPath = p
  return p
}

export function ensureSession(userId: string): AsterSession {
  let s = sessions.get(userId)
  if (!s) {
    s = { status: "stopped", log: [] }
    sessions.set(userId, s)
  }
  return s
}

export function getStatus(userId: string) {
  const s = ensureSession(userId)
  return {
    status: s.status,
    pid: s.pid ?? null,
    startedAt: s.startedAt ?? null,
    hasConfig: !!s.configPath && existsSync(s.configPath),
    lastError: s.lastError ?? null,
  }
}

export function getLogs(userId: string, limit = 200) {
  const s = ensureSession(userId)
  const logs = s.log
  return logs.slice(Math.max(0, logs.length - limit))
}

export function start(userId: string) {
  const s = ensureSession(userId)
  if (!s.configPath || !existsSync(s.configPath)) {
    throw new Error("Config not found. Save your API keys first.")
  }
  if (s.status === "running" && s.proc) {
    throw new Error("Bot already running")
  }

  const repo = getAsterRepoPath()
  const runScript = join(repo, "run_bot.py")
  const args = [runScript, s.configPath]
  const env = { ...process.env, PYTHONUNBUFFERED: "1" }

  const py = spawn("python", args, { cwd: repo, env })
  s.proc = py
  s.pid = py.pid
  s.status = "running"
  s.startedAt = Date.now()
  s.lastError = undefined

  const push = (line: string) => {
    s.log.push(line)
    if (s.log.length > 1000) s.log.splice(0, s.log.length - 1000)
  }
  py.stdout.on("data", (buf) => push(buf.toString()))
  py.stderr.on("data", (buf) => push("[err] " + buf.toString()))
  py.on("exit", (code, signal) => {
    s.status = code === 0 ? "stopped" : "error"
    s.proc = undefined
    s.pid = undefined
    if (code && code !== 0) s.lastError = `Exited with code ${code}`
    if (signal) s.lastError = `Terminated by ${signal}`
  })
}

export function stop(userId: string) {
  const s = ensureSession(userId)
  if (!s.proc) return
  try {
    s.proc.kill()
  } catch {}
}

export function buildDefaultConfig(input: { apiKey: string; secretKey: string } & Partial<Record<string, any>>) {
  const defaults = {
    base_url: "https://fapi.asterdex.com",
    symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT"],
    cycle_interval: 0.5,
    log_level: "INFO",
    multi_symbol_settings: {
      max_concurrent_positions: 3,
      symbol_rotation_enabled: true,
      shared_margin_management: true,
    },
    trading_settings: {
      risk_per_trade: 5.0,
      min_profit_target: 0.8,
      max_position_time: 600,
      trading_fee: 0.035,
      scalping_mode: true,
      min_trade_interval: 30,
      min_position_size: 0.001,
      force_min_order: true,
      leverage: 10,
      max_margin_per_trade: 30.0,
    },
    technical_indicators: {
      rsi_period: 14,
      sma_short: 5,
      sma_long: 10,
      rsi_oversold: 30,
      rsi_overbought: 70,
    },
    risk_management: {
      max_daily_loss: 50.0,
      max_consecutive_losses: 5,
      position_size_multiplier: 1.0,
      emergency_stop: false,
    },
    monitoring: {
      performance_snapshot_interval: 300,
      alert_thresholds: { min_win_rate: 40, max_drawdown: 20, min_profit_factor: 1.0 },
    },
  }
  return {
    ...defaults,
    api_key: input.apiKey,
    secret_key: input.secretKey,
    ...input,
  }
}

