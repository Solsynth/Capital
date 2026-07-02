import { db } from '#server/utils/db'
import { user } from '#server/db'
import { eq } from 'drizzle-orm'
import { getSolarToken, fetchSolarApi } from '#server/utils/sn'

const PROFILE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function getCachedSolarProfile(userId: string, force = false) {
  const [record] = await db
    .select({
      solarProfile: user.solarProfile,
      solarProfileUpdatedAt: user.solarProfileUpdatedAt,
      solarAccountId: user.solarAccountId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!record) return null

  const isFresh = record.solarProfile
    && record.solarProfileUpdatedAt
    && (Date.now() - record.solarProfileUpdatedAt.getTime()) < PROFILE_TTL_MS

  if (!force && isFresh) {
    return record.solarProfile
  }

  const token = await getSolarToken(userId)
  if (!token) return record.solarProfile

  try {
    const profile = await fetchSolarApi(token, '/passport/accounts/me')
    const accountId = profile.id || record.solarAccountId || null

    await db.update(user).set({
      solarProfile: profile,
      solarProfileUpdatedAt: new Date(),
      solarAccountId: accountId,
      name: profile.nick || profile.name || undefined,
    }).where(eq(user.id, userId))

    return profile
  } catch {
    return record.solarProfile
  }
}

export async function refreshSolarProfile(userId: string) {
  return getCachedSolarProfile(userId, true)
}
