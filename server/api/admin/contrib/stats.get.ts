import { db } from '~~/server/utils/db'
import { contribClaSignature, contribGithubStats, contribPendingCheck } from '~~/server/db/schema'
import { eq, sql, and, desc } from 'drizzle-orm'
import { CLA_VERSION } from '~~/server/utils/cla'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401 })

  const [stats] = await db
    .select({
      totalSignatures: sql<number>`count(*)`,
      currentSignatures: sql<number>`count(*) filter (where ${contribClaSignature.claVersion} = ${CLA_VERSION})`,
    })
    .from(contribClaSignature)

  const [{ count: pendingChecks }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contribPendingCheck)
    .where(eq(contribPendingCheck.status, 'pending'))

  const [{ count: totalUsers }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contribGithubStats)

  return {
    totalSignatures: stats.totalSignatures,
    currentSignatures: stats.currentSignatures,
    pendingChecks,
    totalTrackedUsers: totalUsers,
    currentClaVersion: CLA_VERSION,
  }
})
