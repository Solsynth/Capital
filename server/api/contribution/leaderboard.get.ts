import { db } from '~~/server/utils/db'
import { contribGithubStats } from '~~/server/db/schema'
import { desc, sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      githubUserId: contribGithubStats.githubUserId,
      githubUsername: contribGithubStats.githubUsername,
      solarUsername: contribGithubStats.solarUsername,
      solarDisplayName: contribGithubStats.solarDisplayName,
      prCount: contribGithubStats.prCount,
      issueCount: contribGithubStats.issueCount,
      commitCount: contribGithubStats.commitCount,
    })
    .from(contribGithubStats)
    .orderBy(desc(sql`${contribGithubStats.prCount} * 5 + ${contribGithubStats.issueCount} * 3 + ${contribGithubStats.commitCount}`))
    .limit(50)

  return {
    leaderboard: rows.map((row, i) => ({
      rank: i + 1,
      githubUsername: row.githubUsername,
      solarUsername: row.solarUsername,
      solarDisplayName: row.solarDisplayName,
      prCount: row.prCount,
      issueCount: row.issueCount,
      commitCount: row.commitCount,
    })),
  }
})
