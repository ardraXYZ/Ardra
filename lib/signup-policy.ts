import type { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const EXISTING_USERS_ALLOWANCE = 36
export const INITIAL_ACCESS_CODE = "ARDRA250"
export const INITIAL_ACCESS_BATCH = 250
export const INVITE_ONLY_CAP = 1000
export const INITIAL_CODE_BONUS = 25_000
export const REFERRAL_BONUS = 2_000

export type SignupPhase = "legacy" | "initial-code" | "invite-only" | "open"

export function determineSignupPhase(totalUsers: number): SignupPhase {
  if (totalUsers < EXISTING_USERS_ALLOWANCE) return "legacy"
  if (totalUsers < EXISTING_USERS_ALLOWANCE + INITIAL_ACCESS_BATCH) return "initial-code"
  if (totalUsers < INVITE_ONLY_CAP) return "invite-only"
  return "open"
}

export type SignupAccessStatus = {
  phase: SignupPhase
  totalUsers: number
  nextThreshold: number | null
  remainingUntilNext: number | null
}

export async function getSignupAccessStatus(client: PrismaClient = prisma): Promise<SignupAccessStatus> {
  const actualUsers = await client.user.count()
  const totalUsers = Math.max(actualUsers, EXISTING_USERS_ALLOWANCE)
  const phase = determineSignupPhase(totalUsers)
  let nextThreshold: number | null = null
  if (phase === "legacy") nextThreshold = EXISTING_USERS_ALLOWANCE
  else if (phase === "initial-code") nextThreshold = EXISTING_USERS_ALLOWANCE + INITIAL_ACCESS_BATCH
  else if (phase === "invite-only") nextThreshold = INVITE_ONLY_CAP
  const remainingUntilNext = nextThreshold != null ? Math.max(0, nextThreshold - totalUsers) : null
  return { phase, totalUsers, nextThreshold, remainingUntilNext }
}

export class InviteGateError extends Error {
  status: number
  code: string

  constructor(code: string, message: string, status = 403) {
    super(message)
    this.name = "InviteGateError"
    this.code = code
    this.status = status
  }
}

export type InviteRequirementResolution =
  | { phase: SignupPhase; requirement: "none"; normalizedCode: string | null; totalUsers: number }
  | { phase: SignupPhase; requirement: "initial-code"; normalizedCode: string; totalUsers: number }
  | {
      phase: SignupPhase
      requirement: "referral"
      normalizedCode: string
      referrerId: string
      referrerRefCode: string
      totalUsers: number
    }

export async function resolveInviteRequirement({
  inviteCode,
  client = prisma,
  totalUsersOverride,
}: {
  inviteCode: string | null
  client?: PrismaClient
  totalUsersOverride?: number
}): Promise<InviteRequirementResolution> {
  const actualUsers =
    typeof totalUsersOverride === "number" && Number.isFinite(totalUsersOverride)
      ? totalUsersOverride
      : await client.user.count()
  const totalUsers = Math.max(actualUsers, EXISTING_USERS_ALLOWANCE)
  const phase = determineSignupPhase(totalUsers)
  const normalizedCode = inviteCode?.trim().toUpperCase() || null

  if (phase === "initial-code") {
    if (normalizedCode !== INITIAL_ACCESS_CODE) {
      throw new InviteGateError(
        "initial_code_required",
        "An invite code is required to join the current cohort.",
        401
      )
    }
    return { phase, requirement: "initial-code", normalizedCode, totalUsers }
  }

  if (phase === "invite-only") {
    if (!normalizedCode) {
      throw new InviteGateError(
        "invite_required",
        "Provide the invite shared by an existing Ardra member.",
        401
      )
    }
    const referrer = await client.user.findFirst({
      where: { refCode: normalizedCode },
      select: { id: true, refCode: true },
    })
    if (!referrer) {
      throw new InviteGateError("invalid_invite", "Invite code not recognized or no longer active.", 401)
    }
    return {
      phase,
      requirement: "referral",
      normalizedCode: referrer.refCode,
      referrerId: referrer.id,
      referrerRefCode: referrer.refCode,
      totalUsers,
    }
  }

  return { phase, requirement: "none", normalizedCode, totalUsers }
}
