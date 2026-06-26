import { db } from '~~/server/utils/db'
import { contribGithubStats, contribClaSignature, account } from '~~/server/db/schema'
import { desc, sql, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Get all stats with a join to find the Solar account ID via CLA signature
  const rows = await db
    .select({
      githubUserId: contribGithubStats.githubUserId,
      githubUsername: contribGithubStats.githubUsername,
      prCount: contribGithubStats.prCount,
      issueCount: contribGithubStats.issueCount,
      commitCount: contribGithubStats.commitCount,
      total: sql<number>`${contribGithubStats.prCount} * 5 + ${contribGithubStats.issueCount} * 3 + ${contribGithubStats.commitCount}`,
      solarAccountId: account.accountId,
    })
    .from(contribGithubStats)
    .leftJoin(
      contribClaSignature,
      eq(contribClaSignature.githubUsername, contribGithubStats.githubUsername),
    )
    .leftJoin(
      account,
      sql`${account.userId} = ${contribClaSignature.userId} AND ${account.providerId} = 'solian'`,
    )
    .orderBy(desc(sql`${contribGithubStats.prCount} * 5 + ${contribGithubStats.issueCount} * 3 + ${contribGithubStats.commitCount}`))
    .limit(50)

  // Resolve Solar usernames from account IDs
  const leaderboard = []
  for (const row of rows) {
    let solarUsername: string | null = null
    if (row.solarAccountId) {
      try {
        const resp = await fetch(`https://api.solian.app/users/${row.solarAccountId}`)
        if (resp.ok) {
          const user = await resp.json()
          solarUsername = user.preferred_username || user.name
        }
      } catch {}
    }

    leaderboard.push({
      rank: leaderboard.length + 1,
      githubUsername: row.githubUsername,
      solarUsername,
      prCount: row.prCount,
      issueCount: row.issueCount,
      commitCount: row.commitCount,
      total: row.total,
    })
  }

  return { leaderboard }
})
