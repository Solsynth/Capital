import { db } from '~~/server/utils/db'
import { contribClaSignature, account } from '~~/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSolarUser } from '~~/server/utils/sn'
import { getHeatmap } from '~~/server/utils/github-stats'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username required' })
  }

  const solarUser = await getSolarUser(username)
  if (!solarUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const [linkedAccount] = await db
    .select()
    .from(account)
    .where(and(
      eq(account.providerId, 'solian'),
      eq(account.accountId, String(solarUser.id)),
    ))
    .limit(1)

  if (!linkedAccount) return { days: [] }

  const [signature] = await db
    .select()
    .from(contribClaSignature)
    .where(eq(contribClaSignature.userId, linkedAccount.userId))
    .orderBy(desc(contribClaSignature.signedAt))
    .limit(1)

  if (!signature?.githubUserId) return { days: [] }

  const days = await getHeatmap(signature.githubUserId, signature.githubUsername)
  return { days }
})
