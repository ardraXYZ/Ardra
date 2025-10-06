"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Status = {
  status: "stopped" | "running" | "error"
  pid: number | null
  startedAt: number | null
  hasConfig: boolean
  lastError: string | null
}

export function AsterControl() {
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  async function loadStatus() {
    try {
      const res = await fetch("/api/aster/status", { cache: "no-store" })
      const data = await res.json()
      setStatus(data.status)
    } catch {}
  }

  async function loadLogs() {
    try {
      const res = await fetch("/api/aster/logs", { cache: "no-store" })
      const data = await res.json()
      setLogs(Array.isArray(data.logs) ? data.logs : [])
    } catch {}
  }

  useEffect(() => {
    void loadStatus()
    void loadLogs()
    const t = setInterval(() => {
      void loadStatus()
      void loadLogs()
    }, 3000)
    return () => clearInterval(t)
  }, [])

  async function saveConfig() {
    setBusy(true)
    try {
      const res = await fetch("/api/aster/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Failed to save config")
      }
      await loadStatus()
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to save config")
    } finally {
      setBusy(false)
    }
  }

  async function startBot() {
    setBusy(true)
    try {
      const res = await fetch("/api/aster/start", { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Failed to start bot")
      }
      await loadStatus()
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to start bot")
    } finally {
      setBusy(false)
    }
  }

  async function stopBot() {
    setBusy(true)
    try {
      const res = await fetch("/api/aster/stop", { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Failed to stop bot")
      }
      await loadStatus()
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Failed to stop bot")
    } finally {
      setBusy(false)
    }
  }

  const running = status?.status === "running"

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Aster bot control</h3>
        <span className={"text-sm " + (running ? "text-emerald-300" : status?.status === "error" ? "text-red-400" : "text-white/60")}>{status?.status ?? "unknown"}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Aster API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="bg-black/50 border-white/20 text-white" />
        <Input placeholder="Aster Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="bg-black/50 border-white/20 text-white" />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => { void saveConfig() }} disabled={busy} className="h-10 px-5 bg-cyan-500 text-black hover:bg-cyan-400">Save config</Button>
        <Button onClick={() => { void startBot() }} disabled={busy || running} className="h-10 px-5 bg-emerald-400/90 text-black hover:bg-emerald-300">Start</Button>
        <Button onClick={() => { void stopBot() }} disabled={busy || !running} variant="outline" className="h-10 px-5 border-white/30 text-white hover:bg-white/10">Stop</Button>
      </div>
      <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/50 p-3 text-xs font-mono text-white/70">
        {logs.length === 0 ? <p className="text-white/40">No logs yet.</p> : logs.map((l, i) => (<pre key={i} className="whitespace-pre-wrap">{l}</pre>))}
      </div>
      <p className="text-xs text-white/50">Note: Requires Python 3.10+ and dependencies installed in <code>AsterBot-src</code> (pip install -r requirements.txt).</p>
    </div>
  )
}

