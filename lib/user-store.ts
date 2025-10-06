import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

import { hashPassword, verifyPassword } from "./password"

export type FarmId = "aster" | "hyperliquid" | "pacifica" | "paradex" | "backpack" | "avantis" | "standx"

export type AuthProviderType = "google" | "evm" | "solana"

export type AuthBinding = {
  type: AuthProviderType
  providerId: string
  label?: string
  metadata?: Record<string, string>
}

export type WalletValue = string | { evm?: string; solana?: string; manual?: string }

export type UserRecord = {
  id: string
  name: string
  slug: string
  refCode: string
  email?: string
  passwordHash?: string
  referredBy?: string
  referrals: string[]
  wallets: Record<string, WalletValue>
  points: number
  referralPoints: number
  feesGenerated: number
  referralFees: number
  createdAt: string
  updatedAt: string
  authBindings: AuthBinding[]
}

const dataPath = path.join(process.cwd(), "data", "users.json")

const DEFAULT_WALLETS: Record<string, WalletValue> = {
  aster: "",
  hyperliquid: "",
  pacifica: "",
  paradex: "",
  backpack: "",
  avantis: "",
  standx: "",
  lighter: "",
  evm: "",
  solana: "",
}

async function ensureStore() {
  try {
    await fs.access(dataPath)
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, "[]", "utf-8")
  }
}

function normalizeProviderId(type: AuthProviderType, providerId: string) {
  const value = providerId.trim()
  switch (type) {
    case "google":
    case "evm":
      return value.toLowerCase()
    case "solana":
    default:
      return value
  }
}

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || typeof metadata !== "object") return undefined
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string" && value.trim()) {
      entries[key] = value.trim()
    }
  }
  return Object.keys(entries).length > 0 ? entries : undefined
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim().toLowerCase()
  return trimmed || undefined
}

function isEvmAddress(value: string) {
  return /^0x[0-9a-fA-F]{40}$/.test((value ?? "").trim())
}

function sanitizeWalletValue(value: unknown): WalletValue | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    return isEvmAddress(trimmed) ? trimmed.toLowerCase() : trimmed
  }
  if (!value || typeof value !== "object") return undefined
  const record = value as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const [key, raw] of Object.entries(record)) {
    if (typeof raw !== "string") continue
    const trimmed = raw.trim()
    if (!trimmed) continue
    if (key === "evm") {
      result.evm = isEvmAddress(trimmed) ? trimmed.toLowerCase() : trimmed
    } else if (key === "solana") {
      result.solana = trimmed
    } else if (key === "manual") {
      result.manual = trimmed
    } else {
      result[key] = trimmed
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}
function sanitizeWalletUpdates(wallets?: Record<string, unknown>) {
  if (!wallets || typeof wallets !== "object") return {}
  const entries: Record<string, WalletValue> = {}
  for (const [key, value] of Object.entries(wallets)) {
    const sanitized = sanitizeWalletValue(value)
    if (sanitized) {
      entries[key] = sanitized
    }
  }
  return entries
}

function normalizeWallets(wallets?: Record<string, unknown>) {
  const base: Record<string, WalletValue> = { ...DEFAULT_WALLETS }
  if (!wallets || typeof wallets !== "object") {
    return base
  }
  for (const [key, value] of Object.entries(wallets)) {
    const sanitized = sanitizeWalletValue(value)
    if (sanitized) {
      base[key] = sanitized
    }
  }
  return base
}

function normalizeBindings(bindings: unknown): AuthBinding[] {
  if (!Array.isArray(bindings)) return []
  const seen = new Set<string>()
  const normalized: AuthBinding[] = []
  for (const entry of bindings) {
    if (!entry || typeof entry !== "object") continue
    const type = (entry as { type?: string }).type
    const providerId = (entry as { providerId?: string }).providerId
    if (type !== "google" && type !== "evm" && type !== "solana") continue
    if (typeof providerId !== "string" || !providerId.trim()) continue
    const normalizedId = normalizeProviderId(type, providerId)
    const key = `${type}:${normalizedId}`
    if (seen.has(key)) continue
    seen.add(key)

    const metadata = sanitizeMetadata((entry as { metadata?: Record<string, unknown> }).metadata)
    const labelRaw = (entry as { label?: string }).label
    const label = typeof labelRaw === "string" && labelRaw.trim() ? labelRaw.trim() : undefined

    const binding: AuthBinding = { type, providerId: normalizedId }
    if (label) binding.label = label
    if (metadata) binding.metadata = metadata
    normalized.push(binding)
  }
  return normalized
}

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function hydrateUser(raw: unknown): UserRecord {
  const record = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>
  const rawName = record.name
  const name = typeof rawName === "string" && rawName.trim() ? rawName : "Pilot"
  const rawSlug = record.slug
  const slugCandidate = typeof rawSlug === "string" && rawSlug.trim() ? rawSlug : slugifyName(name)
  const rawRefCode = record.refCode
  const refCode =
    typeof rawRefCode === "string" && rawRefCode.trim()
      ? rawRefCode
      : crypto.randomUUID().slice(0, 8).toUpperCase()

  const email = normalizeEmail(record.email)
  const rawPasswordHash = record.passwordHash
  const passwordHash =
    typeof rawPasswordHash === "string" && rawPasswordHash.trim()
      ? rawPasswordHash.trim()
      : undefined

  const rawReferrals = record.referrals
  const referrals = Array.isArray(rawReferrals)
    ? rawReferrals.filter((id): id is string => typeof id === "string")
    : []

  const rawPoints = record.points
  const rawReferralPoints = record.referralPoints
  const rawFeesGenerated = record.feesGenerated
  const rawReferralFees = record.referralFees

  const createdAt = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString()
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString()

  return {
    id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
    name,
    slug: slugCandidate || slugifyName(name),
    refCode,
    email,
    passwordHash,
    referredBy: typeof record.referredBy === "string" ? record.referredBy : undefined,
    referrals,
    wallets: normalizeWallets(record.wallets as Record<string, unknown> | undefined),
    points: Number.isFinite(rawPoints) ? Number(rawPoints) : 0,
    referralPoints: Number.isFinite(rawReferralPoints) ? Number(rawReferralPoints) : 0,
    feesGenerated: Number.isFinite(rawFeesGenerated) ? Number(rawFeesGenerated) : 0,
    referralFees: Number.isFinite(rawReferralFees) ? Number(rawReferralFees) : 0,
    createdAt,
    updatedAt,
    authBindings: normalizeBindings(record.authBindings),
  }
}

export async function readUsers(): Promise<UserRecord[]> {
  await ensureStore()
  try {
    const raw = await fs.readFile(dataPath, "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(hydrateUser)
  } catch (error) {
    console.error("[user-store] Failed to read users", error)
    return []
  }
}

async function writeUsers(users: UserRecord[]) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true })
  await fs.writeFile(
    dataPath,
    JSON.stringify(
      users.map((user) => ({
        ...user,
        email: normalizeEmail(user.email),
        wallets: normalizeWallets(user.wallets),
        authBindings: normalizeBindings(user.authBindings),
      })),
      null,
      2
    ),
    "utf-8"
  )
}

function ensureUniqueName(users: UserRecord[], desired: string) {
  const base = desired.trim() || "Pilot"
  const existing = new Set(users.map((user) => user.name.trim().toLowerCase()))
  if (!existing.has(base.toLowerCase())) return base
  let suffix = 2
  while (suffix < 10000) {
    const candidate = `${base} ${suffix}`
    if (!existing.has(candidate.trim().toLowerCase())) return candidate
    suffix += 1
  }
  return `${base} ${crypto.randomUUID().slice(0, 4)}`
}

function ensureUniqueSlug(users: UserRecord[], baseSlug: string) {
  const candidate = baseSlug || "pilot"
  const existing = new Set(users.map((user) => user.slug))
  if (!existing.has(candidate)) return candidate
  let suffix = 2
  while (suffix < 10000) {
    const slug = `${candidate}-${suffix}`
    if (!existing.has(slug)) return slug
    suffix += 1
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 4)}`
}

function generateUniqueRefCode(existing: UserRecord[]): string {
  let attempt = ""
  const tries = new Set(existing.map((u) => u.refCode.toLowerCase()))
  do {
    attempt = crypto.randomUUID().slice(0, 8).replace(/-/g, "").toUpperCase()
  } while (tries.has(attempt.toLowerCase()))
  return attempt
}

function applyWalletUpdates(user: UserRecord, updates?: Record<string, unknown>) {
  const sanitized = sanitizeWalletUpdates(updates)
  if (!Object.keys(sanitized).length) return
  user.wallets = { ...normalizeWallets(user.wallets), ...sanitized }
}

function applyBinding(user: UserRecord, binding: AuthBinding) {
  const providerId = normalizeProviderId(binding.type, binding.providerId)
  const metadata = sanitizeMetadata(binding.metadata)
  const label = binding.label && binding.label.trim() ? binding.label.trim() : undefined
  const existing = user.authBindings.find((entry) => entry.type === binding.type && entry.providerId === providerId)
  if (existing) {
    if (label) existing.label = label
    if (metadata) existing.metadata = { ...(existing.metadata ?? {}), ...metadata }
    return false
  }
  const newBinding: AuthBinding = { type: binding.type, providerId }
  if (label) newBinding.label = label
  if (metadata) newBinding.metadata = metadata
  user.authBindings.push(newBinding)
  return true
}

type CreateUserOptions = {
  name: string
  referralCode?: string | null
  binding?: AuthBinding
  walletUpdates?: Record<string, unknown>
  email?: string
  passwordHash?: string
}

function createUser(users: UserRecord[], options: CreateUserOptions) {
  const now = new Date().toISOString()
  const uniqueName = ensureUniqueName(users, options.name)
  const baseSlug = slugifyName(uniqueName) || "pilot"
  const slug = ensureUniqueSlug(users, baseSlug)
  const refCode = generateUniqueRefCode(users)
  const wallets = normalizeWallets(options.walletUpdates)
  const email = normalizeEmail(options.email)
  const passwordHash =
    typeof options.passwordHash === "string" && options.passwordHash.trim()
      ? options.passwordHash.trim()
      : undefined

  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    name: uniqueName,
    slug,
    refCode,
    email,
    passwordHash,
    referrals: [],
    wallets,
    points: 0,
    referralPoints: 0,
    feesGenerated: 0,
    referralFees: 0,
    createdAt: now,
    updatedAt: now,
    authBindings: [],
  }

  if (options.binding) {
    applyBinding(newUser, options.binding)
  }

  let referrer: UserRecord | null = null
  if (options.referralCode) {
    const referenced = users.find(
      (user) => user.refCode.toLowerCase() === options.referralCode!.trim().toLowerCase()
    )
    if (referenced) {
      newUser.referredBy = referenced.id
      referenced.referrals = Array.from(new Set([...(referenced.referrals ?? []), newUser.id]))
      referenced.referralPoints = (referenced.referralPoints ?? 0) + 50
      referenced.updatedAt = now
      referrer = referenced
    }
  }

  users.push(newUser)
  return { user: newUser, referrer }
}

function deriveNameFromBinding(type: AuthProviderType, providerId: string, label?: string) {
  if (label && label.trim()) {
    return label.trim()
  }
  if (type === "google") {
    const localPart = providerId.split("@")[0] ?? "pilot"
    const cleaned = localPart.replace(/[^a-zA-Z0-9]+/g, " ").trim()
    if (!cleaned) return "Pilot"
    return cleaned
      .split(/\s+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }
  if (type === "evm") {
    const trimmed = providerId.replace(/^0x/, "")
    return `EVM ${trimmed.slice(0, 4).toUpperCase()}${trimmed.slice(-4).toUpperCase()}`
  }
  if (type === "solana") {
    return `Sol ${providerId.slice(0, 4)}...${providerId.slice(-4)}`
  }
  return "Pilot"
}

export class EmailAuthError extends Error {
  status: number
  code: string

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.name = "EmailAuthError"
    this.status = status
    this.code = code
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AuthenticateEmailParams = {
  email: string
  password: string
  referralCode?: string | null
  name?: string
}

export async function authenticateUserWithEmail({
  email,
  password,
  referralCode,
  name,
}: AuthenticateEmailParams): Promise<UpsertUserResult> {
  const normalizedEmail = normalizeEmail(email)
  const passwordInput = typeof password === "string" ? password : ""
  const cleanedPassword = passwordInput.trim()

  if (!normalizedEmail) {
    throw new EmailAuthError("invalid_request", "Email is required")
  }
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new EmailAuthError("invalid_email", "Enter a valid email address")
  }
  if (!cleanedPassword) {
    throw new EmailAuthError("invalid_request", "Password is required")
  }

  const users = await readUsers()
  const now = new Date().toISOString()

  const existing = users.find((user) => normalizeEmail(user.email) === normalizedEmail)

  if (!existing) {
    const googleBound = users.find((user) =>
      user.authBindings.some(
        (binding) => binding.type === "google" && normalizeProviderId(binding.type, binding.providerId) === normalizedEmail
      )
    )
    if (googleBound) {
      throw new EmailAuthError(
        "email_linked_google",
        "This email is already linked to a Google sign-in. Use Google to access your account.",
        409
      )
    }
  }

  if (existing) {
    if (!existing.passwordHash) {
      throw new EmailAuthError(
        "password_not_set",
        "This account does not have a password yet. Use another login method.",
        409
      )
    }

    const isValid = await verifyPassword(cleanedPassword, existing.passwordHash)
    if (!isValid) {
      throw new EmailAuthError("invalid_credentials", "Invalid email or password", 401)
    }

    existing.email = normalizedEmail
    existing.updatedAt = now
    await writeUsers(users)
    return { user: existing, created: false, bindingAdded: false }
  }

  if (cleanedPassword.length < 8) {
    throw new EmailAuthError("weak_password", "Password must be at least 8 characters long")
  }

  const passwordHash = await hashPassword(cleanedPassword)
  const displayName =
    typeof name === "string" && name.trim().length >= 2 ? name.trim() : deriveNameFromBinding("google", normalizedEmail)

  const { user, referrer } = createUser(users, {
    name: displayName,
    referralCode,
    email: normalizedEmail,
    passwordHash,
  })

  user.updatedAt = now
  await writeUsers(users)
  return { user, created: true, referrer, bindingAdded: false }
}

export async function findUserById(id: string) {
  const users = await readUsers()
  return users.find((user) => user.id === id) ?? null
}

export async function findUserByRefCode(refCode: string) {
  const users = await readUsers()
  return (
    users.find((user) => user.refCode.toLowerCase() === refCode.trim().toLowerCase()) ?? null
  )
}

export async function findUserByName(name: string) {
  const users = await readUsers()
  return (
    users.find((user) => user.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null
  )
}

export async function findUserByAuthBinding(type: AuthProviderType, providerId: string) {
  const normalizedId = normalizeProviderId(type, providerId)
  const users = await readUsers()
  return (
    users.find((user) =>
      user.authBindings.some((binding) => binding.type === type && binding.providerId === normalizedId)
    ) ?? null
  )
}

type UpsertUserResult = {
  user: UserRecord
  created: boolean
  referrer?: UserRecord | null
  bindingAdded?: boolean
}

export async function upsertUserByName(
  name: string,
  referralCode?: string | null
): Promise<UpsertUserResult> {
  const users = await readUsers()
  const now = new Date().toISOString()
  const cleanName = name.trim()

  const existing = users.find(
    (user) => user.name.trim().toLowerCase() === cleanName.toLowerCase()
  )

  if (existing) {
    existing.updatedAt = now
    await writeUsers(users)
    return { user: existing, created: false, bindingAdded: false }
  }

  const { user, referrer } = createUser(users, { name: cleanName, referralCode })
  await writeUsers(users)
  return { user, created: true, referrer, bindingAdded: false }
}

type UpsertByBindingParams = {
  type: AuthProviderType
  providerId: string
  referralCode?: string | null
  name?: string
  label?: string
  metadata?: Record<string, unknown>
  wallets?: Record<string, unknown>
}

export async function upsertUserByAuthBinding({
  type,
  providerId,
  referralCode,
  name,
  label,
  metadata,
  wallets,
}: UpsertByBindingParams): Promise<UpsertUserResult> {
  const users = await readUsers()
  const normalizedId = normalizeProviderId(type, providerId)
  const now = new Date().toISOString()
  const binding: AuthBinding = {
    type,
    providerId: normalizedId,
  }
  if (label && label.trim()) binding.label = label.trim()
  const sanitizedMetadata = sanitizeMetadata(metadata)
  if (sanitizedMetadata) binding.metadata = sanitizedMetadata

  const existing = users.find((user) =>
    user.authBindings.some((entry) => entry.type === type && entry.providerId === normalizedId)
  )

  if (existing) {
    const bindingAdded = applyBinding(existing, binding)
    if (type === "google" && !existing.email) {
      existing.email = normalizedId
    }
    applyWalletUpdates(existing, wallets)
    existing.updatedAt = now
    await writeUsers(users)
    return { user: existing, created: false, referrer: null, bindingAdded }
  }

  const fallbackName = deriveNameFromBinding(type, normalizedId, label)
  const finalName = name && name.trim().length >= 2 ? name.trim() : fallbackName
  const walletUpdates = wallets ?? {}
  const { user, referrer } = createUser(users, {
    name: finalName,
    referralCode,
    binding,
    walletUpdates,
    email: type === "google" ? normalizedId : undefined,
  })
  await writeUsers(users)
  return { user, created: true, referrer, bindingAdded: true }
}

export async function updateUserWallets(userId: string, wallets: Record<string, WalletValue>) {
  const users = await readUsers()
  const target = users.find((user) => user.id === userId)
  if (!target) return null
  applyWalletUpdates(target, wallets)
  target.updatedAt = new Date().toISOString()
  await writeUsers(users)
  return target
}

export async function recordUserActivity(
  userId: string,
  { points = 0, fees = 0 }: { points?: number; fees?: number }
) {
  const users = await readUsers()
  const target = users.find((user) => user.id === userId)
  if (!target) return null

  const now = new Date().toISOString()
  target.points = Math.max(0, (target.points ?? 0) + points)
  target.feesGenerated = Math.max(0, (target.feesGenerated ?? 0) + fees)
  target.updatedAt = now

  if (fees > 0 && target.referredBy) {
    const referrer = users.find((user) => user.id === target.referredBy)
    if (referrer) {
      const referralShare = fees * 0.1
      referrer.referralFees = (referrer.referralFees ?? 0) + referralShare
      referrer.referralPoints = (referrer.referralPoints ?? 0) + points * 0.2
      referrer.updatedAt = now
    }
  }

  await writeUsers(users)
  return target
}

export type LeaderboardEntry = {
  id: string
  name: string
  refCode: string
  points: number
  referralPoints: number
  totalPoints: number
  feesGenerated: number
  referralFees: number
  totalFees: number
  referrals: number
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const users = await readUsers()
  const entries = users.map((user) => {
    const basePoints = user.points ?? 0
    const refPoints = user.referralPoints ?? 0
    const baseFees = user.feesGenerated ?? 0
    const refFees = user.referralFees ?? 0

    return {
      id: user.id,
      name: user.name,
      refCode: user.refCode,
      points: basePoints,
      referralPoints: refPoints,
      totalPoints: Math.round(basePoints + refPoints),
      feesGenerated: Number(baseFees.toFixed(2)),
      referralFees: Number(refFees.toFixed(2)),
      totalFees: Number((baseFees + refFees).toFixed(2)),
      referrals: user.referrals?.length ?? 0,
    }
  })

  return entries.sort((a, b) => b.totalPoints - a.totalPoints)
}
export type PublicUser = Omit<UserRecord, "passwordHash">

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user
  void _passwordHash
  return publicUser
}


