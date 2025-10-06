import crypto from "node:crypto"

const SESSION_COOKIE = "ardra_session"
const SECRET = process.env.SESSION_SECRET ?? "ardra-dev-secret"
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export { SESSION_COOKIE }

type SessionPayload = {
  userId: string
  exp: number
  iat: number
}

function encode(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function sign(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url")
}

export function createSessionToken(userId: string) {
  const now = Date.now()
  const payload: SessionPayload = {
    userId,
    iat: now,
    exp: now + SESSION_TTL_MS,
  }
  const base = encode(payload)
  const signature = sign(base)
  return `${base}.${signature}`
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [base, signature] = token.split(".")
  if (!base || !signature) return null
  const expected = sign(base)
  const provided = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (provided.length !== expectedBuffer.length) return null
  if (!crypto.timingSafeEqual(provided, expectedBuffer)) return null
  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf-8")) as SessionPayload
    if (!payload?.userId || typeof payload.exp !== "number") return null
    if (payload.exp < Date.now()) return null
    return payload
  } catch (error) {
    console.error("[session] Failed to parse session payload", error)
    return null
  }
}

