import { db } from '~~/server/utils/db'
import { contribGithubStats, contribClaSignature, account } from '~~/server/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { cacheSolarUser } from '~~/server/utils/sn'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401 })

  // Find all contributors without a cached Solar username
  const uncached = await db
    .select({
      githubUsername: contribGithubStats.githubUsername,
      userId: contribClaSignature.userId,
    })
    .from(contribGithubStats)
    .innerJoin(
      contribClaSignature,
      eq(contribClaSignature.githubUsername, contribGithubStats.githubUsername),
    )
    .where(isNull(contribGithubStats.solarUsername))

  let updated = 0
  for (const row of uncached) {
    const [solarAccount] = await db
      .select({ accountId: account.accountId })
      .from(account)
      .where(and(eq(account.userId, row.userId), eq(account.providerId, 'solian')))
      .limit(1)

    if (solarAccount) {
      const username = await cacheSolarUser(row.githubUsername, solarAccount.accountId)
      if (username) updated++
    }
  }

  return { total: uncached.length, updated }
})
