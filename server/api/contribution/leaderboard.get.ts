import { db } from '~~/server/utils/db'
import { contribGithubStats } from '~~/server/db/schema'
import { desc, sql } from 'drizzle-orm'

const SOLAR_API = 'https://api.solian.app'

export default defineEventHandler(async (event) => {
  const rows = await db
    .select({
      githubUserId: contribGithubStats.githubUserId,
      githubUsername: contribGithubStats.githubUsername,
      prCount: contribGithubStats.prCount,
      issueCount: contribGithubStats.issueCount,
      commitCount: contribGithubStats.commitCount,
      total: sql<number>`${contribGithubStats.prCount} + ${contribGithubStats.issueCount} + ${contribGithubStats.commitCount}`,
    })
    .from(contribGithubStats)
    .orderBy(desc(sql`${contribGithubStats.prCount} + ${contribGithubStats.issueCount} + ${contribGithubStats.commitCount}`))
    .limit(50)

  return {
    leaderboard: rows.map((row, i) => ({
      rank: i + 1,
      githubUsername: row.githubUsername,
      prCount: row.prCount,
      issueCount: row.issueCount,
      commitCount: row.commitCount,
      total: row.total,
    })),
  }
})
