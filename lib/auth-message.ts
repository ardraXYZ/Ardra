export type ParsedLoginMessage = {
  address: string
  timestamp: number
}

function extractField(lines: string[], key: string) {
  const needle = `${key.toLowerCase()}`
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (!lower.startsWith(needle)) continue
    return line.slice(key.length).trim().replace(/^:/, "").trim()
  }
  return null
}

export function parseLoginMessage(message: string): ParsedLoginMessage | null {
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return null

  const heading = lines[0].toLowerCase()
  if (!heading.includes("ardra") || !heading.includes("login")) return null

  const addressRaw = extractField(lines, "address")
  const timestampRaw = extractField(lines, "timestamp")

  if (!addressRaw || !timestampRaw) return null

  const timestamp = Date.parse(timestampRaw)
  if (Number.isNaN(timestamp)) return null

  return {
    address: addressRaw,
    timestamp,
  }
}

export function isTimestampFresh(timestamp: number, toleranceMs = 5 * 60 * 1000) {
  const delta = Math.abs(Date.now() - timestamp)
  return delta <= toleranceMs
}
